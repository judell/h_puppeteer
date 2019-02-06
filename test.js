const puppeteer = require('puppeteer')
const https = require('https')
const fs = require('fs')

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
  //'http://jonudell.net/h/ee12.pdf',

  //'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf',
  'https://arxiv.org/pdf/1606.02960.pdf',
  /*
  'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf', // https://github.com/hypothesis/client/issues/259
  'https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable', // https://github.com/hypothesis/product-backlog/issues/338
  'https://arxiv.org/pdf/1606.02960.pdf', // https://github.com/hypothesis/client/issues/266
  'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf',
  'http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf',
  'https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf',
  'http://download.krone.at/pdf/ceta.pdf',
  'https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf',
  'https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf'
  */
]

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
  await delay(seconds)
}

async function callSearchApi(testUrl) {
  return new Promise((resolve, reject) => {
    let apiUrl = `https://hypothes.is/api/search?limit=200&uri=${testUrl}`
    let data = ''
    https.get(apiUrl, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
      })
      resp.on('end', () => {
        resolve(data)
      })
      resp.on('error', () => {
        reject(e)
      })
    })
  })
}

async function runPdfTest(testUrlIndex, testUrl) {

  const apiHighlights = {}
  const results = {}  

  // gather results from the api
  let apiResults = await getApiResults(testUrl)

  //convert apiResults to expected highlights
  for (let i = 0, anno; i < apiResults.length; i++) {
    anno = apiResults[i].anno
    apiHighlights[anno.id] = anno.quote
  }

  let browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--remote-debugging-port=9222',
      //'--window-size=1800,1000'
      // '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
    ]
  })

  await waitSeconds(5) // give extension time to load

  let pages = await browser.pages()
  let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
  const client = await page.target().createCDPSession()
  await client.send('Page.navigate', { url: testUrl })
  let seconds = 20
  console.log(`waiting ${seconds}`)
  await waitSeconds(seconds)
  const pdfPageCount = await page.evaluate(() => {
    let _pdfPages = Array.from(document.querySelectorAll('.page'))
    return Promise.resolve(_pdfPages.length)
  })

  let ids = Object.keys(apiHighlights)

  createFirefoxScript(testUrlIndex, testUrl, pdfPageCount, ids, apiHighlights)

  // step through the ids of annotations expected to anchor
  for (let i = 0; i < ids.length; i++) {

    apiResult = apiResults[i]

    let id = ids[i]
    console.log(`working on ${id}, ${apiHighlights[id]}`)

    // search for the highlight the api says should be there

    let anchored = await page.evaluate((id, apiHighlights, pdfPageCount) => {  // this block runs in the browser
      let searchText = apiHighlights[id]
      console.log(`evaluating id ${id}, pdfPageCount ${pdfPageCount}, searchText ${searchText}`)
      async function waitSeconds(seconds) {
        function delay(seconds) {
          return new Promise(resolve => setTimeout(resolve, seconds * 1000))
        }
        await delay(seconds)
      }
      let findInput = document.getElementById('findInput')  // get the pdfjs search input box
      findInput.value = searchText                          // put in the annotation's exact quote
      PDFViewerApplication.findBar.dispatchEvent('')        // tell pdfjs to find it
      let seconds = 5                                   // give that time to happen
      console.log(`waiting ${seconds}`)
      setTimeout( _ => { }, 0)
      return waitSeconds(seconds)
        .then( _ => {
          let highlights = Array.from(document.querySelectorAll(`.h_${id}`))  // look for ids as decorated by tweaked extension
          let highlight = highlights[0]

          const anchored = {}
          anchored[id] = {
            anchoredHighlight: '',
            outcome: null,
            id: id,
          }

          let hl

          if (highlight && highlight.click) {

            highlights = highlights.map(hl => { return { text: hl.innerText } })

            for (let i = 0, hl; i < highlights.length; i++) {
              if ( i == 0 ) {
                highlight.click()
                setTimeout( _ => { }, 0)
              }

              hl = highlights[i]
              if (hl.text === 'Loading annotations…') {
                anchored[id].anchoredHighlight = hl.text
                anchored[id].outcome = 'loading'
                console.log('loading')
                break
              }

              anchored[id].anchoredHighlight += hl.text  // accumulate highlight text in the document

              if (anchored[id].anchoredHighlight === apiHighlights[id]) {  // exactly equal to api result?
                anchored[id].outcome = 'exact'
                console.log('exact')
                break
              }

              if (i == highlights.length - 1) {  // something matched
                anchored[id].outcome = 'fuzzy'
                console.log('fuzzy')
                break
              }
            }
            return Promise.resolve(anchored)
          } else {
            console.log('orphan')
            anchored[id].outcome = 'orphan'
            return Promise.resolve(anchored)
          }
        })
    }, id, apiHighlights, pdfPageCount)
    console.log(`anchored ${JSON.stringify(anchored)}`)
    results[id] = anchored[id]
  }

  await browser.close()
  
  return { 
    testUrl: testUrl, 
    pdfPageCount: pdfPageCount, 
    apiHighlights: apiHighlights, 
    results: results
  }

  async function getApiResults(testUrl) {
    let apiResults = JSON.parse(await (callSearchApi(testUrl)))
    let apiRows = apiResults.rows.filter(row => {
      let selectors = parseSelectors(row.target)
      return Object.keys(selectors).length // filter out page notes
    })
    apiResults = apiRows.map(row => {
      let anno = parseAnnotation(row)
      let selectors = parseSelectors(row.target)
      let textPosition = selectors.TextPosition
      return { id: row.id, anno: anno, start: textPosition.start }
    })
    apiResults.sort((a, b) => {  // put highlights in document order
      return a.start - b.start
    })
    return apiResults
  }
}

async function runTestOnAllPdfUrls() {
  let results = []
  for (let i = 0; i < testUrls.length; i++) {
    let r = await runPdfTest(i, testUrls[i])
    results.push(r)
  }
  return Promise.resolve(results)
}

runTestOnAllPdfUrls()
  .then(results => {
    digestPdfResults(results);
  })

function digestPdfResults(results) {
  let summary = {};
  let keys = Object.keys(results);
  keys.forEach(key => {
    let result = results[key];
    console.log(`${result.testUrl} (pages: ${result.pdfPageCount})`)
    let summary = {}
    let expectedIds = Object.keys(result.results)
    expectedIds.forEach(id => {
      summary[id] = result
    })
    summary = `{ ${JSON.stringify(summary, null, 2)} }`
    console.log(summary);
    fs.writeFile(`${key}.json`, summary, err => {
      if (err) throw err
    })
  })
}

function createFirefoxScript(testUrlIndex, testUrl, pdfPageCount, ids, apiHighlights, searchText) {
  let script
  fs.readFile('firefoxInject.js', 'utf8', (err, data) => {
    if (err) throw err
    script = data
    script = script.replace('__TEST_URL_INDEX__', testUrlIndex)
    script = script.replace('__TEST_URL__', `"${testUrl}"`)
    script = script.replace('__PDF_PAGE_COUNT__', pdfPageCount)
    script = script.replace('__IDS__', JSON.stringify(ids))
    script = script.replace('__API_HIGHLIGHTS__', JSON.stringify(apiHighlights))
    script = script.replace('__SEARCH_TEXT__', `"${searchText}"`)
    fs.writeFile(`${testUrlIndex}.ff.js`, script, err => {
      if (err) throw err
    })
  })
}

// from hlib

function parseAnnotation(row) {
  let id = row.id;
  let url = row.uri;
  let updated = row.updated.slice(0, 19);
  let group = row.group;
  let title = url;
  let refs = row.references ? row.references : [];
  let user = row.user.replace('acct:', '').replace('@hypothes.is', '');
  let quote = '';
  if (row.target && row.target.length) {
    let selectors = row.target[0].selector;
    if (selectors) {
      for (let i = 0; i < selectors.length; i++) {
        let selector = selectors[i];
        if (selector.type === 'TextQuoteSelector') {
          quote = selector.exact;
        }
      }
    }
  }
  let text = row.text ? row.text : '';
  let tags = row.tags;
  try {
    title = row.document.title;
    if (typeof title === 'object') {
      title = title[0];
    }
    else {
      title = url;
    }
  }
  catch (e) {
    title = url;
  }
  let isReply = refs.length > 0;
  let isPagenote = row.target && !row.target[0].hasOwnProperty('selector');
  let r = {
    id: id,
    url: url,
    updated: updated,
    title: title,
    refs: refs,
    isReply: isReply,
    isPagenote: isPagenote,
    user: user,
    text: text,
    quote: quote,
    tags: tags,
    group: group,
    target: row.target
  };
  return r;
}

function parseSelectors(target) {
  let parsedSelectors = {};
  let firstTarget = target[0];
  if (firstTarget) {
    let selectors = firstTarget.selector;
    if (selectors) {
      let textQuote = selectors.filter(function (x) {
        return x.type === 'TextQuoteSelector';
      });
      if (textQuote.length) {
        parsedSelectors['TextQuote'] = {
          exact: textQuote[0].exact,
          prefix: textQuote[0].prefix,
          suffix: textQuote[0].suffix
        };
      }
      let textPosition = selectors.filter(function (x) {
        return x.type === 'TextPositionSelector';
      });
      if (textPosition.length) {
        parsedSelectors['TextPosition'] = {
          start: textPosition[0].start,
          end: textPosition[0].end
        };
      }
    }
  }
  return parsedSelectors
}