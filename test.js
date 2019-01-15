const puppeteer = require('puppeteer')

const CRX_PATH = '/users/jon/onedrive/h/1.93/'

function delay(seconds) {
  return new Promise( resolve => setTimeout(resolve, seconds * 1000))
}

async function waitSeconds(seconds) {
  await delay(seconds)
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
    await client.send('Page.navigate', { url: "http://jonudell.net/h/ee12.pdf" })
    await waitSeconds(2)
    const highlights = await page.evaluate(() => {
      let highlights = document.querySelectorAll('hypothesis-highlight')
      highlights = Array.from(highlights)
      return Promise.resolve(highlights.map(hl => hl.innerHTML))
    })
    console.log(highlights)
})
  