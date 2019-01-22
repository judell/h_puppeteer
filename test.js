const puppeteer = require('puppeteer')
const https = require('https')

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrl = 'http://jonudell.net/h/ee12.pdf'

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
  
puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--remote-debugging-port=9222',
      // '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
    ]
  })
  .then(async browser => {
    await waitSeconds(2) // give extension time to load
    let pages = await browser.pages()
    let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
    const client = await page.target().createCDPSession()
    await client.send('Runtime.enable')
    await client.send('Page.navigate', { url: testUrl })
    await waitSeconds(3)
    const highlights = await page.evaluate(() => {
      let _highlights = Array.from(document.querySelectorAll('hypothesis-highlight'))
      _highlights = _highlights.map(_hl => {return {text: _hl.innerHTML, class: _hl.getAttribute('class')}})
      return Promise.resolve(_highlights)
    })
    let anchored = {}
    highlights.forEach(highlight => {
      // ids are sent from the sidebar, and added to the classname by annotator, 
      // in order to coalesce highlights that span dom nodes
      let annoId = highlight.class.replace('anotator-hl ','') 
      if (! anchored[annoId]) {
        anchored[annoId] = ''
      }
      anchored[annoId] += highlight.text
    })
    console.log(anchored)

    let apiResults = await(callSearchApi(testUrl))
    console.log(apiResults)
  })

