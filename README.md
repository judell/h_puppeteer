Update: This tool is now retired in favor of @robertknight's vastly superior https://github.com/hypothesis/anchoring-test-tools.

Final report for this tool: https://github.com/judell/h_puppeteer/blob/master/final-report.md

---

This tool compares the annotations stored in the Hypothesis database with the annotations that actually anchor in documents. It focused initially on PDFs, in order to evaluate whether there is a risk in moving from PDF.js v1 to v2. But it now also works with HTML docs.

The tool rests on a pyramid of supporting technologies. At the base is headless Chrome, the next level up is the Chrome dev tools (CDP)  protocol, and then puppeteer which provides high-level abstractions over the dev tools protocol.

Puppeteer is an NPM module, and the tool runs partly in the node.js environment, but it also runs partly in the browser under test. For a given document, the tool queries the Hypothesis API to find out which annotations are expected to anchor in the document. It then injects a Hypothesis client which has been [lightly customized for this test](https://github.com/hypothesis/client/compare/master...judell:pass-ids-for-anchor-test). (The client is built into a Hypothesis extension that's referenced from `CRX_PATH` and that runs locally.) The custom client passes the ID of each annotation from the sidebar to the annotator. It does this so that the highlights that accrue to a given annotation ID can be coalesced. That matters for HTML documents because an annotation that spans multiple nodes in the DOM will be spread across multiple highlights. It matters even more for PDFs because there, a given annotation will span many text nodes. By decorating each of those nodes with the annotation ID it belongs to, the tool can figure out which highlights belong to which annotation IDs.

Since it is not unusual for an annotated PDF to be 500 pages long, the initial strategy was to automate a search of the PDF for the target selections in each of the annotations, which can be sparsely distributed. I couldn't get that to work reliably, so I fell back to a strategy that visits each PDF page division and looks for highlights on that page. [ed: That was unnecessary, as Rob's tool shows, you can query for the highlights even when not displayed.] That seems to work well, it takes a while on large documents, but computers don't mind waiting.

