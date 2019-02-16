# TL;DR

My conclusion so far is that what we see here is so heavily dominated by https://github.com/hypothesis/product-backlog/issues/954 that it might make sense to see if that's a straightforward fix, which I think it might be, and fix that first.

If we could at the same time make a branch of the extension with that fix, and with PDF.js 2, we could run through a larger set of tests much more efficiently. Part of what makes this slow is that although a series of tests can be run automatically in Chrome for PDF.js 1, I haven't gotten an extension working for Chrome with PDF.js 2. So to test PDF.js 2 I'm using Firefox, manually injecting generated scripts, and collecting the results. That bottleneck would go away if I could toggle between Chrome extensions built with 1 and 2 respectively.

# Results

|Chrome / PDF.js 1|Firefox / PDF.js 2 
|---|-
| --- different number of orphans --- |
| http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf | http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf
| fuzzy 21, exact 41, orphan 1, total 63 | fuzzy 50, exact 9, orphan 4, total 63
| http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf | http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf
| fuzzy 1, exact 9, orphan 0, total 10 | fuzzy 4, exact 5, orphan 1, total 10
| <a href="https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf">https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c43...</a> | <a href="https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf">https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c43...</a>
| fuzzy 109, exact 34, orphan 6, total 149 | fuzzy 87, exact 57, orphan 5, total 149
| <a href="http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf">http://blogs.iac.gatech.edu/...Understanding_Comics.pdf</a> | <a href="http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf">http://blogs.iac.gatech.edu/...Understanding_Comics.pdf</a>
| fuzzy 34, exact 110, orphan 71, total 215 | fuzzy 93, exact 39, orphan 83, total 215
| http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/Introduction-to-Kindred.pdf | "http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/Introduction-to-Kindred.pdf
| fuzzy 30, exact 43, orphan 5, total 78 | fuzzy 31, exact 40, orphan 7, total 78
| --- same  number of orphans --- |
| http://download.krone.at/pdf/ceta.pdf | http://download.krone.at/pdf/ceta.pdf 
|fuzzy 1, exact 25, orphan 0, total 26 | fuzzy 1, exact 25, orphan 0, total 26 | 
| <a href="http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf">http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly...</a> | <a href="http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf">http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly...</a> 
|fuzzy 2, exact 12, orphan 0, total 14 | fuzzy 11, exact 3, orphan 0, total 14
| https://arxiv.org/pdf/1606.02960.pdf | https://arxiv.org/pdf/1606.02960.pdf 
| fuzzy 8, exact 13, orphan 2, total 23 |  fuzzy 13, exact 8, orphan 2, total 23
 <a href="https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf">https://twiki.cin.ufpe.br/twiki/pub/TAES/...</a> | <a href="https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf">https://twiki.cin.ufpe.br/twiki/pub/TAES/...</a> |
| fuzzy 1, exact 31, orphan 0, total 32 | fuzzy 1, exact 31, orphan 0, total 32
| http://jonudell.net/h/Rhetoric_and_Crisis.pdf | http://jonudell.net/h/Rhetoric_and_Crisis.pdf
| fuzzy 55, exact 157, orphan 4, total 216 |  fuzzy 126, exact 86, orphan 4, total 216
| http://jonudell.net/h/power-of-habit.pdf | http://jonudell.net/h/power-of-habit.pdf
| fuzzy 0, exact 2, orphan 0, total 2 | fuzzy 0, exact 2, orphan 0, total 2
| http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf | http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf
| fuzzy 1, exact 1, orphan 0, total 2 | fuzzy 1, exact 1, orphan 0, total 2
| http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf | http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf
| fuzzy 16, exact 8, orphan 0, total 24 | fuzzy 1, exact 23, orphan 0, total 24
| <a href="https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf">https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have...</a> | <a href="https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf">https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have...</a> 
| fuzzy 13, exact 49, orphan 0, total 62 | fuzzy 10, exact 52, orphan 0, total 62
| https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf | https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf
| fuzzy 5, exact 34, orphan 0, total 39 | fuzzy 11, exact 28, orphan 0, total 39
| <a href="https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf">https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b...</a> | <a href="https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf">https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b...</a>
| fuzzy 1, exact 94, orphan 5, total 100 | fuzzy 1, exact 94, orphan 5, total 100
| <a href="https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf">https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations...</a> | <a href="https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf">https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations...</a> 
| fuzzy 0, exact 1, orphan 0, total 1 | fuzzy 0, exact 1, orphan 0, total 1
| https://www.govinfo.gov/content/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf | https://www.govinfo.gov/content/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf
| fuzzy 0, exact 6, orphan 0, total 6 | fuzzy 2, exact 4, orphan 0, total 6
| https://valerievacchio.files.wordpress.com/2011/10/paths-of-professional-development.pdf | https://valerievacchio.files.wordpress.com/2011/10/paths-of-professional-development.pdf
| fuzzy 13, exact 1, orphan 0, total 14 | fuzzy 0, exact 14, orphan 0, total 14
| http://www.scu.edu.tw/philos/98class/Peng/05.pdf | http://www.scu.edu.tw/philos/98class/Peng/05.pdf
| fuzzy 0, exact 33, orphan 0, total 33 | fuzzy 1, exact 32, orphan 0, total 33
| https://solaresearch.org/wp-content/uploads/2017/05/chapter4.pdf | https://solaresearch.org/wp-content/uploads/2017/05/chapter4.pdf
| fuzzy 0, exact 8, orphan 0, total 8 | fuzzy 3, exact 5, orphan 0, total 8
|  <a href="https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf">https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar.../a> | <a href="https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf">https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar.../a>
| fuzzy 4, exact 10, orphan 0, total 14 | fuzzy 9, exact 5, orphan 0, total 14
| <a href="https://www.aarp.org/content/dam/aarp/livable-communities/livable-documents/documents-2018/Book-1-Roadmap-to-Livability-Web-010218.pdf">https://www.aarp.org/content/dam/aarp/livable-communities...</a> | <a href="https://www.aarp.org/content/dam/aarp/livable-communities/livable-documents/documents-2018/Book-1-Roadmap-to-Livability-Web-010218.pdf">https://www.aarp.org/content/dam/aarp/livable-communities...</a> 
| fuzzy 1, exact 40, orphan 0, total 41 | fuzzy 7, exact 34, orphan 0, total 41 
| <a href="http://anthro.vancouver.wsu.edu/media/Course_files/anth-510-clare-m-wilkinson/aa194345302a00010.pdf">http://anthro.vancouver.wsu.edu/media/Course_files/anth-510..."></a> | <a href="http://anthro.vancouver.wsu.edu/media/Course_files/anth-510-clare-m-wilkinson/aa194345302a00010.pdf">http://anthro.vancouver.wsu.edu/media/Course_files/anth-510..."></a>
| fuzzy 0, exact 10, orphan 0, total 10 | fuzzy 1, exact 9, orphan 0, total 10
| http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf | http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf
| fuzzy 23, exact 79, orphan 9, total 111 |  fuzzy 23, exact 79, orphan 9, total 111
| http://bogumilkaminski.pl/files/julia_express.pdf | http://bogumilkaminski.pl/files/julia_express.pdf
| fuzzy 0, exact 0, orphan 1, total 1 | fuzzy 0, exact 0, orphan 1, total 1

# Notes

## https://arxiv.org/pdf/1606.02960.pdf

One of the orphans, https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations//oU86YoETEea3F2MLPRnZOA, is a genuine mismatch.

The other, https://hyp.is/A2DBQoEWEea7_jODeE5fXQ/arxiv.org, is a case where the selection crosses a page boundary. This is guaranteed to fail right now, since we don't handle that case. (https://github.com/hypothesis/client/issues/266#issuecomment-293700083)

## http://jonudell.net/h/Rhetoric_and_Crisis.pdf

The test reports a few more orphans than the client does. At first I assumed this was a problem with the test, but it is actually a problem with the client. See https://github.com/hypothesis/product-backlog/issues/954

## cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf

One of the orphans: 

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/pgbFGvOmEeaOU28zzCr5uQ

- exact	:	collaborations between instructional designers and students
- prefix	:	ograms designed by faculty, and 
- suffix	:	 are becoming increasingly popul

Which seems like it'd map unproblematically, in this born-digital document, to:

&lt;div data-canvas-width="354.24" style="left: 429.918px; top: 708.658px; font-size: 15px; font-family: sans-serif; transform: scaleX(1.04124);">and &lt;hypothesis-highlight class="annotator-hl">collaborations between instructional designers &lt;/hypothesis-highlight>&lt;/div>
&lt;div data-canvas-width="356.29799999999994" style="left: 429.918px; top: 726.313px; font-size: 15px; font-family: sans-serif; transform: scaleX(1.09281);">&lt;hypothesis-highlight class="annotator-hl">and students&lt;/hypothesis-highlight> are becoming increasingly popular. &lt;/div>

The others appear similar. 

## https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf

More examples of unreported orphans. They are: 

```
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/xqdiWiUfEemDRYO41_0oiQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/h3L_xiTzEemcPdPjKPP4AA
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/eSx1biQrEem_H0uQ1keNYQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/5iH8UiT4EemI6qtMD5lVww
```

I find that in all these cases, the target of the unreported orphan overlaps the target of one or more anchored annotations. I have updated https://github.com/hypothesis/product-backlog/issues/954 accordingly.

## https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf

The automated test using both Chrome/PDFjs 1 and FF/PDF.js 2 gives the same result: no orphan. But it reliably orphans when using Chrome interactively. 

## http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf

The exact target text is Cxdxxdxxln11, which has been run together from some of the letters but none of the numbers in an equation on page 30. An effort to annotate the same equation in Firefox/PDF.js 2 fails with a differently-mangled exact target text. However, that new annotation does anchor in PDF.js 1. But wait! That doesn't repro. Now we anchor (interactively) to Cxdxxdxxln11 in FF as well. But wait! Now it doesn't. OK, here is the (partial) repro. If you launch FF to page 1, then load H, the annotation seems to anchor, but if you click it in the sidebar, we (apparently) search for the wrong thing, and then it misanchors. If you launch to page 29 (by going to 29 and refreshing, it remembers the page), then launch the bookmarklet, it will anchor.

## https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/

Interactive Chrome and FF both report 161 annos, 5 orphans = 166 total. The test finds 149 total. These are the orphans in Chrome:

```
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/YY0X4Of9EeadjivKr_ClSw 
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/yQM3ROZcEeaz-JtVm8qXpA 
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/xV-QyufmEeaP3W8BM13Fhg 
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/TcdJ-ugNEeadtVc6Hd9nQQ 
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/Kvrh9OZdEeaxHGPr-jkoFQ 

```

The text in them doesn't seem to correspond to the doc. And if you visit them this way:

```
https://hyp.is/YY0X4Of9EeadjivKr_ClSw 
https://hyp.is/yQM3ROZcEeaz-JtVm8qXpA 
https://hyp.is/xV-QyufmEeaP3W8BM13Fhg 
https://hyp.is/TcdJ-ugNEeadtVc6Hd9nQQ 
https://hyp.is/Kvrh9OZdEeaxHGPr-jkoFQ 

```
You get "Enter the password to open this PDF file."

The orphans in FF:

```
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/fhbqODAKEemKnr-ycNOnOw
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/yQM3ROZcEeaz-JtVm8qXpA
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/2sV-3OhMEeaFYq-xQmOV0g
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/TcdJ-ugNEeadtVc6Hd9nQQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/Kvrh9OZdEeaxHGPr-jkoFQ
```

 Does this ring any bells with anyone? I am at a loss to explain this one. Bottom line, I guess:  whatever weirdness may be going on under the covers is the same in Chrome with version 1 and Firefox with version 2.  


## http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf

Under test, Chrome and Firefox agree that there are 9 orphans out of 111 annotations. None are reported as orphans by the interactive client.

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/pmOHTgC4Eeihi-epqyumXw
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/Ex3UXAEnEei2bxdqtXLoUQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/tS5_rgCpEeiRoOsyJiVO7g
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/ijdsvAIGEeihRPs74gvUew
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/NfnOtv_aEeetNIu5nKs1Rg
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/cDQ4mAC5Eeiu-Ss-jRhujA
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/iYYzWACxEeihhXsuq6_xLQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/4uqL5gFrEeiYCXORI0THQQ
https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/04juEgFsEeiie-N5NFk_HA

See http://jonudell.net/h/user-visible-manifestation-of-unreported-orphans.mp4 for a short screencast illustrating how this can look to users.

## http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf

Lots of unreported orphans here because nearly all the annotations overlap since they are trying to anchor to page numbers, so there's a ton of overlap on those targets.

## http://bogumilkaminski.pl/files/julia_express.pdf

In this case there is a legitimate orphan reported by the tester, and interactively, in both Chrome and FF. It looks like the orphan anchored to an earlier iteration of the document's date. Presumably that was changed without changing the fingerprint.