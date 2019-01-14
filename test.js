const puppeteer = require('puppeteer')

const CRX_PATH = '/users/jon/onedrive/h/1.93/'

function currentPage(browser) {
    return new Promise( (resolve,reject) => {
      browser.targets()
        .then( targets => {
          for (let i = 0, I = targets.length; i < I; ++i) {
            target = targets[i]
            let page = target.page()
              .then( page => {
                console.log(page.url())
                if (page) {
                  resolve(page)
                }
              })
          }
        })
        .catch ( _ => {
          reject(null)      
        })

    })
  }

puppeteer.launch({
  headless: false, // extensions only supported in full chrome.
  args: [
    `--disable-extensions-except=${CRX_PATH}`,
    `--load-extension=${CRX_PATH}`,
//    '--user-agent=PuppeteerAgent'
  ]
}).then(async browser => {
  let page = await currentPage(browser)
  console.log(page.url())
  //let page = await browser.targets()[browser.targets().length-1].page();
  //await page.goto('http://jonudell.net/h/power-of-habit.pdf')
})