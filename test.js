const puppeteer = require('puppeteer')
const https = require('https')

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
  //'http://jonudell.net/h/ee12.pdf',
  'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf'
]

function delay(seconds) {
  return new Promise( resolve => setTimeout(resolve, seconds * 1000))
}

async function waitSeconds(seconds) {
  await delay(seconds)
  }

async function callSearchApi(testUrl) {
    return new Promise( (resolve, reject) => {
      let apiUrl = `https://hypothes.is/api/search?uri=${testUrl}`
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
    await client.send('Runtime.enable')
    await client.send('Page.navigate', { url: testUrl })
    await waitSeconds(5)
    const pdfPageCount = await page.evaluate( () => {
      let _pdfPages = Array.from(document.querySelectorAll('.page'))
      return Promise.resolve(_pdfPages.length)
    })

    console.log(pdfPageCount)

    for (let i = 1; i <= 4; i++) {
      await client.send('Page.navigate', { url: `${testUrl}#${i}` })
      const results = await page.evaluate(() => { // this function runs in the browser, is not debuggable here
        document.querySelector('button[name=sidebar-toggle]').click()
        let nodes = Array.from(document.querySelectorAll('hypothesis-highlight'))
        let highlights = nodes.map(node => {return {text: node.innerHTML, class: node.getAttribute('class')}})
        nodes = nodes.filter(node => { return node.innerText != 'Loading annotations…' })
        return Promise.resolve({highlights: highlights, nodeCount: nodes.length, highlightCount: highlights.length})
      })
      let anchored = {}
      results.highlights.forEach(highlight => {
          // ids are sent from the sidebar, and added to the classname by annotator, 
          // in order to coalesce highlights that span dom nodes
          let annoId = highlight.class.replace('anotator-hl ','') 
          if (! anchored[annoId]) {
            anchored[annoId] = ''
          }
          anchored[annoId] += highlight.text
      })
    }


    let apiResults = await(callSearchApi(testUrl))
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
 .then(r => {
   console.log(r)
 })