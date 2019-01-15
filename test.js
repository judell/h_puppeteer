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
    '-- enable-devtools-experiments'
  ]
}).then(async browser => {
  await waitSeconds(2) // give extension time to load
  let pages = await browser.pages()
  let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
  let targets = browser.targets()
  let target = targets.filter (target => target._targetInfo.url.startsWith('https://hypothes.is'))[0]
  //console.log('target\n', target)
  const client = await target.createCDPSession()
  await client.send('Runtime.enable')

  function evaluateExpression(client, expression, contextId) {
    return new Promise( (resolve,reject) => {
      client.send('Runtime.evaluate', { 
        //awaitPromise: false,
        expression: expression, 
        contextId: contextId,
        //returnByValue: true,
        includeCommandLineAPI: true,        
        //generatePreview: true,
        //throwOnSideEffect: true,
        timeOut: 500,
        //userGesture: false
      })
      .then(r => {
        resolve(r.result)
      })
      .catch(e => {
        reject(e)
      })
    })
  }

  client.on('Runtime.executionContextCreated', msg => { 
    let context = msg.context
    let contextId = context.id
    console.log(contextId)
    let expression = "document.querySelectorAll('hypothesis-highlight')"
    if (contextId != 3 ) {
      return
    }
    evaluateExpression(client, expression, contextId)
      .then(r => {
        client.send('Runtime.getProperties', {objectId: r.objectId, ownProperties: true})
          .then(r => {
            console.log(r.result[0])
          })
      })
      .catch(e => {
        console.log(e)
      })
  })

  await waitSeconds(2)

  await client.send('Page.navigate', { url: "http://jonudell.net/h/ee12.pdf" })

})
  