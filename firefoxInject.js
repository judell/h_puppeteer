const testUrlIndex = __TEST_URL_INDEX__
const testUrl = __TEST_URL__
const pdfPageCount = __PDF_PAGE_COUNT__ 
const ids = __IDS__
const apiHighlights =  __API_HIGHLIGHTS__

async function evaluate(id) {
  let findInput = document.getElementById('findInput')  // get the pdfjs search input box
  let searchText = apiHighlights[id]
  findInput.value = searchText                          // put in the annotation's exact quote
  PDFViewerApplication.findBar.dispatchEvent('')        // tell pdfjs to find it
  let seconds = 4                                      // give that time to happen
  console.log(`waiting ${seconds}`)
  await waitSeconds(seconds)
  let highlights = Array.from(document.querySelectorAll(`.h_${id}`))  // look for ids as decorated by tweaked extension
  let highlight = highlights[0]
  try {
    highlight.click()
    highlights = highlights.map(hl => { return { text: hl.innerText } })
    let result = {
      anchoredHighlight: '',
      outcome: null,
    }
    for (let i = 0, hl; i < highlights.length; i++) {
      hl = highlights[i]
      if (hl.text === 'Loading annotations…') {
        result.anchoredHighlight = hl.text
        result.outcome = 'orphan'
        break
      }
      result.anchoredHighlight += hl.text  // accumulate highlight text in the document
      if (result.anchoredHighlight === apiHighlights[id]) {  // exactly equal to api result?
        result.outcome = 'exact'
        break
      }
      if ( i == highlights.length -1 ) {
        result.outcome = 'fuzzy'
      }
    }
    return (result)
  } catch (e) {
    throw (e)
  }
}

async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
  await delay(seconds)
}

async function main() {
  let results = []
  for (let i = 0; i < ids.length; i++) {
    await waitSeconds(2)
    let id = ids[i]
    results.push(await evaluate(id))
  }
  console.log( results )
}

main()
