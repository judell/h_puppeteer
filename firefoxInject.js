const apiHighlights =  __API_HIGHLIGHTS__
const pdfPageCount = __PDF_PAGE_COUNT__
const allIds = Object.keys(apiHighlights)

const waitSecondsBeforeGotoPage = 3

async function evaluate(pageNumber) {

  let selectorPdfjs1 = `.page[id='pageContainer${pageNumber}'] .annotator-hl`
  let selectorPdfjs2 = `.page[data-page-number='${pageNumber}'] .annotator-hl`
  let highlights = Array.from(document.querySelectorAll(selectorPdfjs2))
  console.log(highlights.length, highlights)
  
  let results = {}

  for (i = 0; i < highlights.length; i++) {

    let highlight = highlights[i]

    let id = highlight.className.replace('annotator-hl ','').replace('h_','')

    console.log(`id ${id}`)

    if (! results[id]) {
      results[id] = initResult(id, pageNumber)
    }

    results[id].anchoredHighlight += highlight.innerText

  }

  console.log(`resolving page ${pageNumber} with ${JSON.stringify(results)}`)
  return (Promise.resolve(results))
}

async function goto(pageNumber) {
    let pageElement = document.querySelector(`.page[data-page-number='${pageNumber}']`)
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
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
  await delay(seconds)
}

async function main() {

 let finalResults = {}

  for (let i = 1; i <= pdfPageCount; i++) {
    await waitSeconds(waitSecondsBeforeGotoPage)
    console.log(`goto page ${i}`)
    await goto(i)
    console.log(`evaluate page ${i}`)
    let results = await evaluate(i)
    console.log(results)
    Object.keys(results).forEach(id => {
      finalResults[id] = results[id]
    })
  }

  allIds.forEach(id => {
    if (! finalResults[id]) {
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
  let fuzzy = ids.filter(id => { return finalResults[id].outcome === 'fuzzy' }).length
  let exact = ids.filter(id => { return finalResults[id].outcome === 'exact' }).length
  let orphan = ids.filter(id => { return finalResults[id].outcome === 'orphan' }).length
  let total = fuzzy + exact + orphan 

  console.log(`fuzzy ${fuzzy}, exact ${exact}, orphan ${orphan}, total ${total}`)

  Object.keys(finalResults).forEach(id => {
    console.log( {id: id, page: finalResults[id].pageNumber, outcome: finalResults[id].outcome} )
  })

}

main()

