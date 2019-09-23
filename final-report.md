# Final report

Results from the much more powerful and elegant https://github.com/hypothesis/anchoring-test-tools, for the URLs reported in https://github.com/judell/h_puppeteer/blob/master/results2.md, are in https://github.com/judell/h_puppeteer/blob/master/evaluate-results.json.

In 4 of 32 cases the test timed out:

https://jonudell.info/h/pdfs/979909.pdf

https://jonudell.info/h/pdfs/Mahoney_Introduction_Literature_of_German_Romanticism_gedreht3.pdf

https://jonudell.info/h/pdfs/chapter4.pdf

https://jonudell.info/h/pdfs/julia_express.pdf

I found only one very minor unexplained anomaly. The explained anomalies are related to known page-boundary and overlap issues.

## Unexplained anomalies

### https://jonudell.info/h/pdfs/Plato-Republic.pdf

https://via.hypothes.is/jonudell.info/h/pdfs/Plato-Republic.pdf

annos: 38

https://via.hypothes.is/https://jonudell.info/h/pdfs/Plato-Republic.pdf?via-feature=pdfjs2

annos: 38

test tool in pdfjs2 mode:

  "https://jonudell.info/h/pdfs/Plato-Republic.pdf": {
    "annotationCount": 37,
    "highlightCount": 37,
    "orphanCount": 0,
    "anchorTime": 9499
  },

## Explained anomalies

### overlap (https://github.com/hypothesis/product-backlog/issues/954)

These URLs have more API-reported than side-bar reported annotations, due to overlap. These show up in the results as diffs between the annotationCount and the highlight count, e.g. 

"https://jonudell.info/h/pdfs/Introduction-to-Kindred.pdf": {
    "annotationCount": 77,
    "highlightCount": 71,
    "orphanCount": 1,
    "anchorTime": 7262
  },

Another URL in this category:

https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf

### doc change but no fingerprint change

In this case, the PDF changed but the fingerprint didn't

https://jonudell.info/h/pdfs/julia_express.pdf

### page boundary issue

https://jonudell.info/h/pdfs/CBA-1997.pdf

In this case you have to scroll to the affected page to make the orphan appear. So h_puppeteer, which does that, found the orphan, while anchoring-test-tools, which doesn't, didn't. 

## List of URLs rechecked using the new tool, and also by hand

https://joudell.info/h/pdfs/01-Technology-Matters.pdf
https://jonudell.info/h/pdfs/05.pdf
https://jonudell.info/h/pdfs/1606.02960.pdf
https://jonudell.info/h/pdfs/20180308-Improving-Air-Quality.pdf
https://jonudell.info/h/pdfs/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf
https://jonudell.info/h/pdfs/979909.pdf
https://jonudell.info/h/pdfs/Book-1-Roadmap-to-Livability-Web-010218.pdf
https://jonudell.info/h/pdfs/CBA-1997.pdf
https://jonudell.info/h/pdfs/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf
https://jonudell.info/h/pdfs/Introduction-to-Kindred.pdf
https://jonudell.info/h/pdfs/Knowledge%20of%20Interfaith%20Leader.pdf
https://jonudell.info/h/pdfs/
https://jonudell.info/h/pdfs/McCloud_Understanding_Comics.pdf
https://jonudell.info/h/pdfs/PLAW-110publ252.pdf
https://jonudell.info/h/pdfs/Plato-Republic.pdf
https://jonudell.info/h/pdfs/Quest_to_LearnMacfoundReport.pdf
https://jonudell.info/h/pdfs/Rhetoric_and_Crisis.pdf
https://jonudell.info/h/pdfs/SecondChance_CommColl.pdf
https://jonudell.info/h/pdfs/Tatar-Introduction-BatB-Anthology.pdf
https://jonudell.info/h/pdfs/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf
https://jonudell.info/h/pdfs/astell_from_a_serious_proposal_to_the_ladies.pdf
https://jonudell.info/h/pdfs/when-school-is-not-enough-marsyl.pdf




  



