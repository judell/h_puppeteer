const puppeteer = require('puppeteer')

const CRX_PATH = '/users/jon/hyp/'
//const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const waitSecondsForExtensionToLoad = 5

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
	await delay(seconds)
}

async function setup() {
	let browser = await puppeteer.launch({
		headless: false,
		args: [
			`--disable-extensions-except=${CRX_PATH}`,
			`--load-extension=${CRX_PATH}`,
			'--remote-debugging-port=9222'
			//'--remote-debugging-port=9222'
			//'--window-size=1800,1000'
			// '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
		]
	})
	await waitSeconds(waitSecondsForExtensionToLoad) // give extension time to load	
	const pages = await browser.pages()
  return pages[1]
}


async function run() {
	const testUrl = 'http://example.com'
	console.log(testUrl)
	const page = await setup(testUrl)
	await(page.goto(testUrl))
	const result = await page.evaluate( () => {
		try {
			return document.querySelector('title').innerText
		} catch (e) {
			return e.message
		}
	})
	console.log(`result ${result}`)
}

run()
