const apiHighlights =  __API_HIGHLIGHTS__
const ids = Object.keys(apiHighlights)

async function evaluate(pageNumber) {

  let highlights = Array.from(document.querySelectorAll('.annotator-hl'))
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

function goto(pageNumber) {
    let pageElement = document.querySelector(`.page[data-page-number='${pageNumber}']`)
    console.log(`pageElement ${pageElement}`)
    pageElement.scrollIntoView()
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
    await waitSeconds(1)
    console.log(`goto page ${i}`)
    goto(i)
    await waitSeconds(1)
    console.log(`evaluate page ${i}`)
    let results = await evaluate(i)
    console.log(results)
    Object.keys(results).forEach(id => {
      finalResults[id] = results[id]
    })
  }

  console.log(Object.keys(finalResults).length)  
  console.log(finalResults)

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

  console.log(Object.keys(finalResults).length)  
  console.log(finalResults)

  Object.keys(finalResults).forEach(id => {
    console.log( {id: id, outcome: finalResults[id].outcome} )
  })

}

main()
