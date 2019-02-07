const puppeteer = require('puppeteer')
const https = require('https')
const fs = require('fs')

const waitSecondsBeforeClosingBrowser = 60 * 60 * 2

const CRX_PATH = '/users/jon/onedrive/h/puppeteer/1.113/'

const testUrls = [
	'http://jonudell.net/h/Rhetoric_and_Crisis.pdf'
	//'http://download.krone.at/pdf/ceta.pdf',
	//'http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf',
	//'https://arxiv.org/pdf/1606.02960.pdf', // https://github.com/hypothesis/client/issues/266
	//'https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable', // https://github.com/hypothesis/product-backlog/issues/338
	//'https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf'
	//'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf',
	//'https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf',
	//'https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf',
	//'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf',
	//'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf', // https://github.com/hypothesis/client/issues/259
]

async function waitSeconds(seconds) {
	function delay(seconds) {
		return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
	}
	await delay(seconds)
}

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

	await waitSeconds(5) // give extension time to load

	let pages = await browser.pages()
	let page = pages[1] // 0 is the about page, 1 is the welcome page with h extension loaded
	const client = await page.target().createCDPSession()
	await client.send('Page.navigate', { url: testUrl })
	let seconds = 15
	console.log(`waiting ${seconds}`)
	await waitSeconds(seconds)
	const pdfPageCount = await page.evaluate(() => {
		// this block runs in the browser
		let _pdfPages = Array.from(document.querySelectorAll('.page'))
		return Promise.resolve(_pdfPages.length)
	})

	createFirefoxScript(testUrlIndex, pdfPageCount, apiHighlights)

	let finalResults = {}

	for (let pageNumber = 1; pageNumber <= pdfPageCount; pageNumber++) {
		console.log(`working on page ${pageNumber}`)

		const results = await page.evaluate(
			(pageNumber, apiHighlights) => {
				// this block runs in the browser

				async function goto(pageNumber) {
          await waitSeconds(5)
					let selectorPdfjs1 = `.page[id='pageContainer${pageNumber}'] .annotator-hl`
					let selectorPdfjs2 = `.page[data-page-number='${pageNumber}'] .annotator-hl`
					let pageElement = document.querySelector(selectorPdfjs1)
					console.log(`pageElement ${pageElement}`)
					if (pageElement) {
						pageElement.scrollIntoView()
					} else {
						console.log(`no annotations on page ${pageNumber}`)
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
					let seconds = 5
					console.log(`wait ${seconds} then goto page ${pageNumber}`)
					await waitSeconds(seconds)
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

	console.log(`fuzzy ${fuzzy}, exact ${exact}, orphan ${orphan}, total ${total}`)

	Object.keys(finalResults).forEach((id) => {
		console.log({ id: id, page: finalResults[id].pageNumber, outcome: finalResults[id].outcome })
	})

	await waitSeconds(waitSecondsBeforeClosingBrowser)

	await browser.close()

	return Promise.resolve({
		testUrl: testUrl,
		finalResults: finalResults
	})

	async function getApiResults(testUrl) {
		let apiResults = JSON.parse(await callSearchApi(testUrl))
		let apiRows = apiResults.rows.filter((row) => {
			let selectors = parseSelectors(row.target)
			return Object.keys(selectors).length // filter out page notes
		})
		apiResults = apiRows.map((row) => {
			let anno = parseAnnotation(row)
			let selectors = parseSelectors(row.target)
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

// from hlib

function parseAnnotation(row) {
	let id = row.id
	let url = row.uri
	let updated = row.updated.slice(0, 19)
	let group = row.group
	let title = url
	let refs = row.references ? row.references : []
	let user = row.user.replace('acct:', '').replace('@hypothes.is', '')
	let quote = ''
	if (row.target && row.target.length) {
		let selectors = row.target[0].selector
		if (selectors) {
			for (let i = 0; i < selectors.length; i++) {
				let selector = selectors[i]
				if (selector.type === 'TextQuoteSelector') {
					quote = selector.exact
				}
			}
		}
	}
	let text = row.text ? row.text : ''
	let tags = row.tags
	try {
		title = row.document.title
		if (typeof title === 'object') {
			title = title[0]
		} else {
			title = url
		}
	} catch (e) {
		title = url
	}
	let isReply = refs.length > 0
	let isPagenote = row.target && !row.target[0].hasOwnProperty('selector')
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
	}
	return r
}

function parseSelectors(target) {
	let parsedSelectors = {}
	let firstTarget = target[0]
	if (firstTarget) {
		let selectors = firstTarget.selector
		if (selectors) {
			let textQuote = selectors.filter(function(x) {
				return x.type === 'TextQuoteSelector'
			})
			if (textQuote.length) {
				parsedSelectors['TextQuote'] = {
					exact: textQuote[0].exact,
					prefix: textQuote[0].prefix,
					suffix: textQuote[0].suffix
				}
			}
			let textPosition = selectors.filter(function(x) {
				return x.type === 'TextPositionSelector'
			})
			if (textPosition.length) {
				parsedSelectors['TextPosition'] = {
					start: textPosition[0].start,
					end: textPosition[0].end
				}
			}
		}
	}
	return parsedSelectors
}
