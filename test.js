const puppeteer = require('puppeteer')
const https = require('https')
const fs = require('fs')

const hlib = require('hlib') // a node-compatible version of https://github.com/judell/hlib

const waitSecondsForExtensionToLoad = 5

const waitSecondsForPdfToLoad = 30

const waitSecondsForHtmlToLoad = 30

const waitSecondsBeforeClosingBrowser = 5

const CRX_PATH = '/users/jon/hyp/'  // path to custom extension with this tweak: https://github.com/hypothesis/client/compare/master...judell:pass-ids-for-anchor-test

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
	await delay(seconds)
}

async function httpGet(testUrl) {
	return new Promise((resolve, reject) => {
		let data = ''
		https.get(testUrl, (resp) => {
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

async function callSearchApi(testUrl) {
	return new Promise((resolve, reject) => {
		let params = {
			url: testUrl,
			max: 1000,
			_separate_replies: 'true',
			https: https
		}
		hlib.search(params)
			.then ( data => { resolve(data)} )
	    .catch( reason => {reject(reason)})
	})
}

async function runPdfTest(testUrlIndex, testUrl, pdfVersion) {

	const interimResults = {}

	// gather results from the api
	const { apiHighlights, replyCount, pagenoteCount } = await getApiHighlightsAndPagenoteReplyCounts(testUrl)

	let { page, browser } = await setup(testUrl, waitSecondsForPdfToLoad)

	const pdfPageCount = await page.evaluate( (pdfVersion) => {
		// this block runs in the browser
		let _pdfPages = Array.from(document.querySelectorAll('.page'))
		return Promise.resolve(_pdfPages.length)
	}, pdfVersion)

	for (let pageNumber = 1; pageNumber <= pdfPageCount; pageNumber++) {
		console.log(`working on page ${pageNumber}`)

		const results = await page.evaluate(
			(pageNumber, apiHighlights, pdfVersion) => {  // this block runs in the browser

				async function waitSeconds(seconds) {
					function delay(seconds) {
						return new Promise(resolve => setTimeout(resolve, seconds * 1000))
					}
					await delay(seconds)
				}

				function getPdfJsSelector() {
				  return pdfVersion == 1 ? `.page[id='pageContainer${pageNumber}']` : `.page[data-page-number='${pageNumber}']`
				}

				async function goto(pageNumber) {
					const selectorPdfJs = getPdfJsSelector(pdfVersion)
					console.log(`selectorPdfJs ${selectorPdfJs}`)
					let pageElement = document.querySelector(selectorPdfJs)
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

				async function main() {
					const waitSecondsBeforeGotoPage = 3
					console.log(`wait ${waitSecondsBeforeGotoPage} then goto page ${pageNumber}`)
					await waitSeconds(waitSecondsBeforeGotoPage)
					await goto(pageNumber)
					const selectorPdfJs = `${getPdfJsSelector(pdfVersion)} .annotator-hl`
					let highlights = Array.from(document.querySelectorAll(selectorPdfJs))
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
			apiHighlights,
			pdfVersion
		)

		console.log(results)
		Object.keys(results).forEach((id) => {
			interimResults[id] = results[id]
		})
	}

	let { summaryText, summaryData, finalResults } = classifyResults(interimResults, apiHighlights, replyCount, pagenoteCount)	

	await waitSeconds(waitSecondsBeforeClosingBrowser)

	await browser.close()

	return Promise.resolve({
		summaryText: summaryText,
		summaryData: summaryData,
		testUrl: testUrl,
		pageNotes : pagenoteCount,
		finalResults: finalResults,
		pdfVersion: pdfVersion,
	})
}

async function runHtmlTest(testUrl) {

	// gather results from the api
	const { apiHighlights, replyCount, pagenoteCount } = await getApiHighlightsAndPagenoteReplyCounts(testUrl)

	const badgeResults = await getBadgeResults(testUrl)

	let { page, browser } = await setup(testUrl, waitSecondsForHtmlToLoad)
	
	const results = await page.evaluate(
		(apiHighlights) => {  // this block runs in the browser

			function initResult(id) {
				return {
					apiHighlight: apiHighlights[id],
					anchoredHighlight: '',
					outcome: null
				}
			}

			async function main() {
				async function waitSeconds(seconds) {
					function delay(seconds) {
						return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
					}
					await delay(seconds)
				}
				let selector = '.annotator-hl'
				let waitSecondsBeforeQueryingDom = 5
				await waitSeconds(waitSecondsBeforeQueryingDom)
				let highlights = Array.from(document.querySelectorAll(selector))
				console.log(highlights.length, highlights)
				let results = {}
				for (i = 0; i < highlights.length; i++) {
					let highlight = highlights[i]
					let id = highlight.className.replace('annotator-hl ', '').replace('h_', '')
					console.log(`id ${id}`)
					if (!results[id]) {
						results[id] = initResult(id)
					}
					results[id].anchoredHighlight += highlight.innerText
				}
				return Promise.resolve(results)
			}

			return Promise.resolve(main())

		},
		apiHighlights
	)

	let { summaryText, summaryData, finalResults } = classifyResults(results, apiHighlights, replyCount, pagenoteCount)

	await waitSeconds(waitSecondsBeforeClosingBrowser)

	await browser.close()

	return Promise.resolve({
		summaryText: summaryText,
		summaryData: summaryData,
		testUrl: testUrl,
		badgeCount: badgeResults.total,
		finalResults: finalResults,
		pdfVersion: 0,
	})

}

function classifyResults( results, apiHighlights, replyCount, pagenoteCount ) {
	let finalResults = {}
	let summaryText = ''
	console.log(results)
	Object.keys(results).forEach((id) => {
		finalResults[id] = results[id]
	})
	Object.keys(apiHighlights).forEach((id) => {
		function initResult(id, pageNumber) {
			let result = {
				apiHighlight: apiHighlights[id],
				anchoredHighlight: '',
				outcome: null
			}
			if (pageNumber) {
        result.pageNumber = pageNumber
			}
			return result
		}
		if (!finalResults[id]) {
			finalResults[id] = initResult(id)
			finalResults[id].outcome = 'orphan'
		}
		else {
			if (finalResults[id].anchoredHighlight === apiHighlights[id]) {
				finalResults[id].outcome = 'exact'
			}
			else {
				finalResults[id].outcome = 'fuzzy'
			}
		}
	})
	let ids = Object.keys(finalResults)
	let fuzzy = ids.filter((id) => { return finalResults[id].outcome === 'fuzzy' }).length
	let exact = ids.filter((id) => { return finalResults[id].outcome === 'exact' }).length
	let orphans = ids.filter((id) => {	return finalResults[id].outcome === 'orphan'}).length
	let total = fuzzy + exact + orphans + replyCount + pagenoteCount
	summaryText = `annotations ${fuzzy + exact} (fuzzy ${fuzzy}, exact ${exact}), replies ${replyCount}, pagenotes ${pagenoteCount}, orphans ${orphans}, total ${total}`
	summaryData = {
		annotations: fuzzy + exact,
		fuzzy: fuzzy,
		exact: exact,
		replyCount: replyCount,
		pagenoteCount: pagenoteCount,
		orphans: orphans,
		total: total,
	}
	console.log(summaryText)
	Object.keys(finalResults).forEach((id) => {
		let pageNumber = finalResults[id].pageNumber ? finalResults[id].pageNumber : 'n/a'
		console.log({ id: id, page: pageNumber, outcome: finalResults[id].outcome })
	})
	return { summaryText, summaryData, finalResults }
}

async function getBadgeResults(testUrl) {
	let response = await httpGet(`https://hypothes.is/api/badge?uri=${testUrl}`)
	return JSON.parse(response)
}

async function getApiResults(testUrl) {
	let annotationResults = await callSearchApi(testUrl)

	const replyCount = annotationResults[1].length
	
	const annotationRows = annotationResults[0].filter( row => {
		const selectors = row.target && hlib.parseSelectors(row.target)
		return Object.keys(selectors).length // filter out page notes
	})

	const pagenoteRows = annotationResults[0].filter( row => {
    const anno = hlib.parseAnnotation(row)
		return anno.isPagenote
	})
	
	annotationResults = annotationRows.map((row) => {
		const anno = hlib.parseAnnotation(row)
		const selectors = hlib.parseSelectors(row.target)
		const textPosition = selectors.TextPosition
		return { id: row.id, anno: anno, start: textPosition.start }
	})
	annotationResults.sort((a, b) => {
		// put highlights in document order
		return a.start - b.start
	})

	const pagenoteCount = pagenoteRows.length
	
	return { annotationResults, replyCount, pagenoteCount }
}

async function getApiHighlightsAndPagenoteReplyCounts(testUrl) {
	const apiHighlights = {}
	let { annotationResults, replyCount, pagenoteCount } = await getApiResults(testUrl)
	//convert apiResults to expected highlights
	for (let i = 0, anno; i < annotationResults.length; i++) {
		anno = annotationResults[i].anno
		apiHighlights[anno.id] = anno.quote
	}
	return { apiHighlights, replyCount, pagenoteCount }
}

async function setup(testUrl, loadSeconds) {
	let browser = await puppeteer.launch({
		headless: false,
		userDataDir: '/users/jon/hyp', // to remember login, unnecessary if tests only consider public annotations
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
	console.log(`waiting ${loadSeconds}`)
	await waitSeconds(loadSeconds)
	return { page, browser }
}

async function runTestOnAllPdfUrls(pdfVersion) {
	const testUrls = [
		'http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf',
		/*
		'http://jonudell.net/h/osftest.pdf',
		'http://jonudell.net/h/power-of-habit.pdf', // scan/ocr
		'http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf', // https://github.com/hypothesis/product-backlog/issues/173
		'http://jonudell.net/h/Rhetoric_and_Crisis.pdf',
		'http://download.krone.at/pdf/ceta.pdf',
		'http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf',
		'https://arxiv.org/pdf/1606.02960.pdf', // https://github.com/hypothesis/client/issues/266
		'https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable', // https://github.com/hypothesis/product-backlog/issues/338 // not a pdf
		'https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf',
		'http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf',
		'https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf',
		'https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf',
		'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf',
		'https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf',
		'https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf', // https://github.com/hypothesis/client/issues/259
		'https://valerievacchio.files.wordpress.com/2011/10/paths-of-professional-development.pdf', // scanned, run-together targets
		'http://www.scu.edu.tw/philos/98class/Peng/05.pdf', // has run-together targets
		'https://solaresearch.org/wp-content/uploads/2017/05/chapter4.pdf', // has run-together targets
		'http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf', // has run-together targets
		'https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf', // scanned, run-together targets
		'https://www.aarp.org/content/dam/aarp/livable-communities/livable-documents/documents-2018/Book-1-Roadmap-to-Livability-Web-010218.pdf',
		'https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf',
		'http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf',
		'http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf', // scanned
		'http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/Introduction-to-Kindred.pdf', // scanned
		'http://bogumilkaminski.pl/files/julia_express.pdf', // date changed?
		'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/07/history.pdf?from=http%3A%2F%2Fresearch.microsoft.com%2Fen-us%2Fum%2Fpeople%2Fsimonpj%2Fpapers%2Fhistory-of-haskell%2Fhistory.pdf',
		'https://clalliance.org/wp-content/uploads/files/Quest_to_LearnMacfoundReport.pdf',
		'http://www.kwaldenphd.com/wp-content/uploads/2018/02/CBA-1997.pdf',
		'https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf',
		'https://www.audit.vic.gov.au/sites/default/files/2018-03/20180308-Improving-Air-Quality.pdf',
		'https://educatorinnovator.org/wp-content/uploads/2019/01/when-school-is-not-enough-marsyl.pdf',
		'https://kf6-stage.rit.albany.edu/attachments/56947546535c7c0709beee5c/5b439e63b985b22bc8c90547/1/CG764259_Report%20(4).pdf',
		'https://www.learner.org/courses/amerhistory/pdf/text/AmHst04_Revolutionary.pdf',
		'https://newclasses.nyu.edu/access/content/group/81e3bb2a-f53e-41f2-a2bd-9c1d43e1a545/07islandsofexpertise.pdf',
		'https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf',
		'http://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf',
		'https://jonudell.info/h/ee12.pdf'
		*/
	]
	
	let results = {}
	for (let testUrlIndex = 0; testUrlIndex < testUrls.length; testUrlIndex++) {
		let testUrl = testUrls[testUrlIndex]
		let result = await runPdfTest(testUrlIndex, testUrl, pdfVersion)
		writeResults(testUrlIndex, result, 'pdf', pdfVersion)
		results[testUrl] = result
	}
	console.log(results)
}

// Only for Chrome, no need to create an FF script for PDF.js 1->2 evaluation.
async function runTestOnAllHtmlUrls() {
	const testUrls = [
		 'http://example.com',
		 /*
  	 'https://www.theguardian.com/environment/2016/aug/02/environment-climate-change-records-broken-international-report', // https://github.com/hypothesis/client/issues/73
		 'https://telegra.ph/whatsapp-backdoor-01-16', // https://github.com/hypothesis/client/issues/558
		 'https://dashboard.wikiedu.org/training/students/wikipedia-essentials/policies-and-guidelines-basic-overview', // https://github.com/hypothesis/product-backlog/issues/493
		 'https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/',
		 'https://www.poetryfoundation.org/poems/50364/neutral-tones',
		 'https://hackernoon.com/why-native-app-developers-should-take-a-serious-look-at-flutter-e97361a1c073',
		 'https://lincolnmullen.com/projects/spatial-workshop/literacy.html',
		 'https://www.greenpeace.org/usa/reports/click-clean-virginia/',
		 'https://www.fastcompany.com/28905/brand-called-you',
		 'https://www.forbes.com/sites/danschawbel/2011/12/21/reviving-work-ethic-in-america/#67ab8458449a',
		 'http://mmcr.education/courses/pls206-01-W19/readings/marbury_v_madison.html',
		 'https://www.si.com/vault/2002/03/25/320766/the-real-new-york-giants',
		 'https://www.nytimes.com/2018/12/08/opinion/college-gpa-career-success.html',
		 'https://www.dartmouth.edu/~milton/reading_room/pl/book_3/text.shtml',
		 'http://mikecosgrave.com/annotation/reclaiming-conversation-social-media/',
		 'https://english.writingpzimmer.net/about/snow-day-billy-collins/',
		 'https://www.facinghistory.org/resource-library/video/day-learning-2013-binna-kandola-diffusing-bias',
		 'http://codylindley.com/frontenddevbooks/es2015enlightenment/'
		 */
	]
	const omitted = [
    // embeds client, cannot work. note: no highlights at libretexts, they are missing our css		
		// 'https://human.libretexts.org/Bookshelves/Composition/Book%3A_Successful_College_Composition_(Crowther_et_al.)/3%3A_Rhetorical_Modes_of_Writing/3.1%3A_Narration', 
	]
	let results = {}
	for (let testUrlIndex = 0; testUrlIndex < testUrls.length; testUrlIndex++) {
		let testUrl = testUrls[testUrlIndex]
		let result = await runHtmlTest(testUrl) 
		writeResults(testUrlIndex, result, 'html', '0')
		results[testUrl] = result
	}
	writeResults('all', results, 'html')
}

function writeResults(testUrlIndex, result, mode, pdfVersion) {
	fs.writeFile(`${testUrlIndex}.${mode}.${pdfVersion}.json`, JSON.stringify(result), (err) => {
		if (err)
			throw err
	})
}

//runTestOnAllPdfUrls(1)
runTestOnAllPdfUrls(2)
//runTestOnAllHtmlUrls()