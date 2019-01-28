const puppeteer = require('puppeteer')
const https = require('https')

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
  //'http://jonudell.net/h/ee12.pdf',
  'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf'
  // https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf'
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
  
  let apiResults = JSON.parse(await(callSearchApi(testUrl)))
  apiResults = apiResults.rows.map(row => { return {id: row.id, anno: parseAnnotation(row)} } )
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
      // '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
    ]
  })

  await waitSeconds(2) // give extension time to load

  let pages = await browser.pages()    
  let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
  const client = await page.target().createCDPSession()
  //await client.send('Runtime.enable')
  await client.send('Page.navigate', { url: testUrl })
  await waitSeconds(5)
  const pdfPageCount = await page.evaluate( () => {
    let _pdfPages = Array.from(document.querySelectorAll('.page'))
    return Promise.resolve(_pdfPages.length)
  })

  await waitSeconds(pdfPageCount/25)

  console.log(pdfPageCount)

  const finalResults = {}

  for (let pdfPageIndex = 27; pdfPageIndex <= 27; pdfPageIndex++) {
    //await client.send('Page.navigate', { url: `${testUrl}#${pdfPageIndex}` })
    let pageId = `pageContainer${pdfPageIndex}`
    console.log(`pageId ${pageId}`)
    page.evaluate( pageId => {
      console.log(`pageId ${pageId}`)
      let pageElement = document.getElementById(pageId)
      console.log(`pdfPageElement ${pageElement}`)
      //pageElement.scrollIntoView()
      let findInput = document.getElementById('findInput')
      findInput.value = 'socrates'
      PDFViewerApplication.findBar.dispatchEvent('')
    }, pageId)
    await waitSeconds(3) // let nav settle before running code in the page
    const probeResults = await page.evaluate(() => { // this function runs in the browser, is not debuggable here
      let nodes = Array.from(document.querySelectorAll('hypothesis-highlight'))
      nodes = nodes.filter(node => { return node.innerText !== 'Loading annotations…' }) // remove placeholders
      let highlights = nodes.map(node => {return {text: node.innerText, class: node.getAttribute('class')}})
      return Promise.resolve({highlights: highlights, highlightCount: highlights.length})
    })

    const anchored = {}

    for (let hlIndex = 0, probeHighlight; hlIndex < probeResults.highlights.length; hlIndex++ ) {
      // ids are sent from the sidebar, and added to the classname by annotator, 
      // in order to coalesce highlights that span dom nodes
      probeHighlight = probeResults.highlights[hlIndex]
      let probeAnnoId = probeHighlight.class.replace('annotator-hl ','')
      let apiHighlight = apiHighlights[probeAnnoId] 
      let _anchoredHighlight = anchored[probeAnnoId] ? anchored[probeAnnoId] : ''
      let anchoredHighlight = _anchoredHighlight + probeHighlight.text
      if ( anchoredHighlight === apiHighlight && ! finalResults[probeAnnoId]) {
        finalResults[probeAnnoId] = anchoredHighlight
        continue
      } 
      if (! anchored[probeAnnoId]) {
          anchored[probeAnnoId] = ''
      } 
      anchored[probeAnnoId] += probeHighlight.text
    }
  }

  browser.close()
  return {testUrl: testUrl, anchored: anchored, apiResults: apiResults}
}

async function runTestOnAllPdfUrls() {
  let results = []
  for ( let i=0; i<testUrls.length; i++) {
    let r = await runPdfTest(testUrls[i])
    results.push(r)
  }
  return Promise.resolve(JSON.stringify(results))
}

runTestOnAllPdfUrls()
 .then(results => {
   console.log(JSON.parse(results))
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
