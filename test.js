const puppeteer = require('puppeteer')
const https = require('https')

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
  // 'http://jonudell.net/h/ee12.pdf',
  // 'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf',
  // 'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf', // https://github.com/hypothesis/client/issues/259
  // 'https://www.jyu.fi/edu/laitokset/okl/koulutusala/vkluoko/tietopankki/tutkimusta/viittomakielinen_juhlajulkaisu_nettiversio.pdf', // 404, https://github.com/hypothesis/browser-extension/issues/12
  // 'https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable', // https://github.com/hypothesis/product-backlog/issues/338
  // 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0183175', // not a pdf, https://github.com/hypothesis/client/issues/558
   'https://arxiv.org/pdf/1606.02960.pdf', // https://github.com/hypothesis/client/issues/266
]

function delay(seconds) {
  return new Promise( resolve => setTimeout(resolve, seconds * 1000))
}

async function waitSeconds(seconds) {
  await delay(seconds)
  }

async function callSearchApi(testUrl) {
    return new Promise( (resolve, reject) => {
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
async function runPdfTest(testUrl) {
  
  // gather results from the api
  let apiResults = JSON.parse(await(callSearchApi(testUrl)))
  let apiRows = apiResults.rows.filter( row => {
    selectors = parseSelectors(row.target)
    return Object.keys(selectors).length // filter out page notes
  })
  apiResults = apiRows.map(row => { 
    let anno = parseAnnotation(row)
    let selectors = parseSelectors(row.target)
    let textPosition = selectors.TextPosition
    return {id: row.id, anno: anno, start: textPosition.start} 
  })
  apiResults.sort( (a, b) => {  // put in document order
    return a.start - b.start
  })

  //convert apiResults to expected highlights
  let apiHighlights = {};
  for (let i = 0, anno; i < apiResults.length; i++) {
     anno = apiResults[i].anno;
     apiHighlights[anno.id] = anno.quote
  }
  
  let browser = await  puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--remote-debugging-port=9222',
      //'--window-size=1800,1000'
      // '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
    ]
  })

  await waitSeconds(2) // give extension time to load

  let pages = await browser.pages()    
  let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
  const client = await page.target().createCDPSession()
  await client.send('Page.navigate', { url: testUrl })
  await waitSeconds(5)
  const pdfPageCount = await page.evaluate( () => {
    let _pdfPages = Array.from(document.querySelectorAll('.page'))
    return Promise.resolve(_pdfPages.length)
  })

  await waitSeconds(pdfPageCount/25)
  //await waitSeconds(20)

  const anchoredHighlights = {}

  let ids = Object.keys(apiHighlights)

  for (let i = 0; i < ids.length; i++)  {

    let id = ids[i]
    //console.log(`working on ${id}`)

    let searchText = apiHighlights[id]

    let searchOutcome = await page.evaluate( searchText => {
      try {
        let findInput = document.getElementById('findInput')
        findInput.value = searchText
        PDFViewerApplication.findBar.dispatchEvent('')
      } catch (e) {
        console.error(searchText, e)
        return Promise.resolve(e)
      }
      return Promise.resolve(true)
    }, searchText)

    console.log(`searchOutcome: ${searchOutcome}`)

    await waitSeconds(5)
 
    /*
    let clickOutcome = await page.evaluate( id => {
      let highlight = document.querySelector('.h_' + id)
      console.log(`id: ${id}, highlight ${highlight}`)
      if (highlight && typeof highlight.click === 'function') {
        highlight.click()
        return Promise.resolve(`can click ${id}`)
      } else {
        console.log('cannot click')
        return Promise.resolve(`cannot click ${id}`)
      }
    }, id)
    console.log(`clickOutcome: ${clickOutcome}`)
    */

    const probeResults = await page.evaluate(() => { // this function runs in the browser, is not debuggable here
        let nodes = Array.from(document.querySelectorAll('hypothesis-highlight'))
        //nodes = nodes.filter(node => { return node.innerText !== 'Loading annotations…' }) // remove placeholders
        let highlights = nodes.map(node => {return {text: node.innerText, class: node.getAttribute('class')}})
        return Promise.resolve({highlights: highlights, highlightCount: highlights.length})
    })

    const anchored = {}

    for (let hlIndex = 0, probeHighlight; hlIndex < probeResults.highlights.length; hlIndex++ ) {
      // ids are sent from the sidebar, and added to the classname by annotator, 
      // in order to coalesce highlights that span dom nodes
      probeHighlight = probeResults.highlights[hlIndex]
      let probeAnnoId = probeHighlight.class.replace('annotator-hl h_','')
      let apiHighlight = apiHighlights[probeAnnoId] 
      let _anchoredHighlight = anchored[probeAnnoId] ? anchored[probeAnnoId] : ''
      let anchoredHighlight = _anchoredHighlight + probeHighlight.text
      if ( anchoredHighlight === apiHighlight && ! anchoredHighlights[probeAnnoId]) {
        anchoredHighlights[probeAnnoId] = anchoredHighlight
        continue
      } 
      if (! anchored[probeAnnoId]) {
          anchored[probeAnnoId] = ''
      } 
      anchored[probeAnnoId] += probeHighlight.text
    }
  } 

  browser.close()
  return {testUrl: testUrl, pdfPageCount: pdfPageCount, apiHighlights: apiHighlights, anchoredHighlights: anchoredHighlights}
}

async function runTestOnAllPdfUrls() {
  let results = []
  for ( let i=0; i<testUrls.length; i++) {
    let r = await runPdfTest(testUrls[i])
    results.push(r)
  }
  return Promise.resolve(results)
}

runTestOnAllPdfUrls()
  .then(results => {
    let keys = Object.keys(results)
    keys.forEach(key => {
      let obj = results[key]
      console.log(`${obj.testUrl} (pages: ${obj.pdfPageCount})`)
      let expectedHighlights = obj.apiHighlights
      let anchoredHighlights = obj.anchoredHighlights
      let countMatches = (expectedHighlights.length == anchoredHighlights.length) ? 'yes' : 'no'
      let msg = `expected highlight count matches anchored highlight count? ${countMatches}`
      console.log(msg)
      let expectedIds = Object.keys(expectedHighlights)
      let summary = {}
      expectedIds.forEach(id => {
        let expectedHighlight = expectedHighlights[id]
        let anchoredHighlight = anchoredHighlights.hasOwnProperty(id) ? anchoredHighlights[id] : null
        if (! anchoredHighlight) {
            anchorOutcome = 'none'
          } else if (expectedHighlight === anchoredHighlight) {
            anchorOutcome = 'exact'
          } else {
            anchorOutcome = 'fuzzy'
          }
        let test = (id in anchoredHighlights && expectedHighlight === anchoredHighlight)
        if (test) {
          summary[id] = { expected: expectedHighlight, anchored: true, anchorOutcome: anchorOutcome }
        } else {
          summary[id] = { expected: expectedHighlight, anchored: anchoredHighlight, anchorOutcome: anchorOutcome }
        }
      })
      console.log(`details ${JSON.stringify(summary, null, 2)}`)
    })
  })

// from hlib

function parseAnnotation(row) {
  var id = row.id;
  var url = row.uri;
  var updated = row.updated.slice(0, 19);
  var group = row.group;
  var title = url;
  var refs = row.references ? row.references : [];
  var user = row.user.replace('acct:', '').replace('@hypothes.is', '');
  var quote = '';
  if (row.target && row.target.length) {
      var selectors = row.target[0].selector;
      if (selectors) {
          for (var i = 0; i < selectors.length; i++) {
              let selector = selectors[i];
              if (selector.type === 'TextQuoteSelector') {
                  quote = selector.exact;
              }
          }
      }
  }
  var text = row.text ? row.text : '';
  var tags = row.tags;
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
  var isReply = refs.length > 0;
  var isPagenote = row.target && !row.target[0].hasOwnProperty('selector');
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
  var parsedSelectors = {};
  var firstTarget = target[0];
  if (firstTarget) {
      var selectors = firstTarget.selector;
      if (selectors) {
          var textQuote = selectors.filter(function (x) {
              return x.type === 'TextQuoteSelector';
          });
          if (textQuote.length) {
              parsedSelectors['TextQuote'] = {
                  exact: textQuote[0].exact,
                  prefix: textQuote[0].prefix,
                  suffix: textQuote[0].suffix
              };
          }
          var textPosition = selectors.filter(function (x) {
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
  return parsedSelectors;
}