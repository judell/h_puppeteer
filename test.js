const puppeteer = require('puppeteer')
const https = require('https')
const fs = require('fs')

const hlib = require('hlib')

const waitSecondsForExtensionToLoad = 5

const waitSecondsForPdfToLoad = 25

const waitSecondsBeforeClosingBrowser = 60

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
	//'http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf',
	//'http://jonudell.net/h/osftest.pdf',
	//'http://jonudell.net/h/power-of-habit.pdf', // scan/ocr
	//'http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf', // https://github.com/hypothesis/product-backlog/issues/173
	//'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0183175', // https://github.com/hypothesis/client/issues/558
	//'http://jonudell.net/h/Rhetoric_and_Crisis.pdf',
	//'http://download.krone.at/pdf/ceta.pdf',
	//'http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf',
	//'https://arxiv.org/pdf/1606.02960.pdf', // https://github.com/hypothesis/client/issues/266
	//'https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable', // https://github.com/hypothesis/product-backlog/issues/338 // not a pdf
	//'https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf'
	//'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf',
	//'https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf',
	//'https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf',
	//'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf',
	//'https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf',
	//'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf', // https://github.com/hypothesis/client/issues/259
	//'https://valerievacchio.files.wordpress.com/2011/10/paths-of-professional-development.pdf', // scanned, run-together targets
	//'http://www.scu.edu.tw/philos/98class/Peng/05.pdf', // has run-together targets
	//'https://solaresearch.org/wp-content/uploads/2017/05/chapter4.pdf', // has run-together targets
	//'http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf', // has run-together targets
	//'https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf', // scanned, run-together targets
	//'https://www.aarp.org/content/dam/aarp/livable-communities/livable-documents/documents-2018/Book-1-Roadmap-to-Livability-Web-010218.pdf',
	//'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf',
	//'http://anthro.vancouver.wsu.edu/media/Course_files/anth-510-clare-m-wilkinson/aa194345302a00010.pdf', // scanned
	//'http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf',
	//'http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf', // scanned
	// 'http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/Introduction-to-Kindred.pdf', // scanned
	'http://bogumilkaminski.pl/files/julia_express.pdf' // date changed?
]

async function waitSeconds(seconds) {
	function delay(seconds) {
		return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
	}
	await delay(seconds)
}

/*

* This was a simple node-based wrapper for the Hypothesis API, OK for <= 200 results,
* but missing pagination. Rather than reinvent that here I convered hlib
* into a node-compatible module so I could use hlib.search. Todo, if it ever
* matters: adjust the canonical hlib so it can go both ways, browser + node. 

async function callSearchApi(testUrl) {
	return new Promise((resolve, reject) => {
		let apiUrl = `https://hypothes.is/api/search?limit=200&uri=${testUrl}`
		let data = ''
		https.get(apiUrl, (resp) => {
			resp.on('data', (chunk) => {
				data += chunk
			})
			resp.on('end', () => {
				resolve(data)
			})
			resp.on('error', () => {
				reject(e)
			})
		})
	})
}*/

async function callSearchApi(testUrl) {
	return new Promise((resolve, reject) => {
		let params = {
			url: testUrl,
			max: 1000,
			https: https
		}
		hlib.search(params)
			.then ( data => { resolve(data)} )
	    .catch( reason => {reject(reason)})
	})
}

async function runPdfTest(testUrlIndex, testUrl) {
	const apiHighlights = {}

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
			'--remote-debugging-port=9222'
			//'--window-size=1800,1000'
			// '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
		]
	})

	await waitSeconds(waitSecondsForExtensionToLoad) // give extension time to load

	let pages = await browser.pages()
	let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
	const client = await page.target().createCDPSession()
	await client.send('Page.navigate', { url: testUrl })
	console.log(`waiting ${waitSecondsForPdfToLoad}`)
	await waitSeconds(waitSecondsForPdfToLoad)
	const pdfPageCount = await page.evaluate(() => {
		// this block runs in the browser
		let _pdfPages = Array.from(document.querySelectorAll('.page'))
		return Promise.resolve(_pdfPages.length)
	})

	createFirefoxScript(testUrlIndex, pdfPageCount, apiHighlights)

	let finalResults = {}
	let summary = ''

	for (let pageNumber = 1; pageNumber <= pdfPageCount; pageNumber++) {
		console.log(`working on page ${pageNumber}`)

		const results = await page.evaluate(
			(pageNumber, apiHighlights) => {  // this block runs in the browser

				async function goto(pageNumber) {
					let selectorPdfjs1 = `.page[id='pageContainer${pageNumber}']`
					//let selectorPdfjs2 = `.page[data-page-number='${pageNumber}']`
					let pageElement = document.querySelector(selectorPdfjs1)
					console.log(`pageElement ${pageElement}`)
					if (pageElement) {
						console.log(`scrolling to ${pageNumber}`)
						pageElement.scrollIntoView()
					} else {
						console.log(`cannot goto page ${pageNumber}`)
					}
					return Promise.resolve(true)
				}

				function initResult(id, pageNumber) {
					return {
						apiHighlight: apiHighlights[id],
						anchoredHighlight: '',
						outcome: null,
						pageNumber: pageNumber
					}
				}

				async function waitSeconds(seconds) {
					function delay(seconds) {
						return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
					}
					await delay(seconds)
				}

				async function main() {
					const waitSecondsBeforeGotoPage = 3
					console.log(`wait ${waitSecondsBeforeGotoPage} then goto page ${pageNumber}`)
					await waitSeconds(waitSecondsBeforeGotoPage)
					await goto(pageNumber)
					let selectorPdfjs1 = `.page[id='pageContainer${pageNumber}'] .annotator-hl`
					let selectorPdfjs2 = `.page[data-page-number='${pageNumber}'] .annotator-hl`
					let highlights = Array.from(document.querySelectorAll(selectorPdfjs1))
					console.log(highlights.length, highlights)
					let results = {}
					for (i = 0; i < highlights.length; i++) {
						let highlight = highlights[i]
						let id = highlight.className.replace('annotator-hl ', '').replace('h_', '')
						console.log(`id ${id}`)
						if (!results[id]) {
							results[id] = initResult(id, pageNumber)
						}
						results[id].anchoredHighlight += highlight.innerText
					}
					console.log(`resolving page ${pageNumber} with ${JSON.stringify(results)}`)
					return Promise.resolve(results)
				}

				return Promise.resolve(main())

			},
			pageNumber,
			apiHighlights
		)

		console.log(results)
		Object.keys(results).forEach((id) => {
			finalResults[id] = results[id]
		})
	}

	Object.keys(apiHighlights).forEach((id) => {
		function initResult(id, pageNumber) {
			return {
				apiHighlight: apiHighlights[id],
				anchoredHighlight: '',
				outcome: null,
				pageNumber: pageNumber
			}
		}

		if (!finalResults[id]) {
			finalResults[id] = initResult(id)
			finalResults[id].outcome = 'orphan'
		} else {
			if (finalResults[id].anchoredHighlight === apiHighlights[id]) {
				finalResults[id].outcome = 'exact'
			} else {
				finalResults[id].outcome = 'fuzzy'
			}
		}
	})

	let ids = Object.keys(finalResults)
	let fuzzy = ids.filter((id) => {
		return finalResults[id].outcome === 'fuzzy'
	}).length
	let exact = ids.filter((id) => {
		return finalResults[id].outcome === 'exact'
	}).length
	let orphan = ids.filter((id) => {
		return finalResults[id].outcome === 'orphan'
	}).length
	let total = fuzzy + exact + orphan

	summary = `fuzzy ${fuzzy}, exact ${exact}, orphan ${orphan}, total ${total}`
	console.log(summary)

	Object.keys(finalResults).forEach((id) => {
		console.log({ id: id, page: finalResults[id].pageNumber, outcome: finalResults[id].outcome })
	})

	await waitSeconds(waitSecondsBeforeClosingBrowser)

	await browser.close()

	return Promise.resolve({
		summary: summary,
		testUrl: testUrl,
		finalResults: finalResults
	})

	async function getApiResults(testUrl) {
		let apiResults = await callSearchApi(testUrl)
		let apiRows = apiResults[0].filter((row) => {
			let selectors = hlib.parseSelectors(row.target)
			return Object.keys(selectors).length // filter out page notes
		})
		apiResults = apiRows.map((row) => {
			let anno = hlib.parseAnnotation(row)
			let selectors = hlib.parseSelectors(row.target)
			let textPosition = selectors.TextPosition
			return { id: row.id, anno: anno, start: textPosition.start }
		})
		apiResults.sort((a, b) => {
			// put highlights in document order
			return a.start - b.start
		})
		return apiResults
	}
}

function createFirefoxScript(testUrlIndex, pdfPageCount, apiHighlights) {
	let script
	fs.readFile('firefoxInject.js', 'utf8', (err, data) => {
		if (err) throw err
		script = data
		script = script.replace('__API_HIGHLIGHTS__', JSON.stringify(apiHighlights))
		script = script.replace('__PDF_PAGE_COUNT__', pdfPageCount)
		fs.writeFile(`${testUrlIndex}.ff.js`, script, (err) => {
			if (err) throw err
		})
	})
}

async function runTestOnAllPdfUrls() {
	let results = {}
	for (let testUrlIndex = 0; testUrlIndex < testUrls.length; testUrlIndex++) {
		let testUrl = testUrls[testUrlIndex]
		let result = await runPdfTest(testUrlIndex, testUrl)
		fs.writeFile(`${testUrlIndex}.json`, JSON.stringify(result), (err) => {
			if (err) throw err
		})
		results[testUrl] = result
	}
}

runTestOnAllPdfUrls()



