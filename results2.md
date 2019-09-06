# Setup

In Chrome, the automated test is using the current stable distro of PDF.js, from https://mozilla.github.io/pdf.js/getting_started/#download, v2.0.943.

Interactively, I'm using:

1. Shipping Chrome extension with 1.1.25
2. Test Chrome extension with 2.0.943
3. Firefox with 2.1.97

The test extension is the H client tweaked in 2 ways:

1. The extension uses <a href="https://github.com/hypothesis/client/compare/master...judell:pass-ids-for-anchor-test">an extra id attribute</a> on anchored annotations so the test can correlate them to expected results.

2. The /web and /content folders contain PDF.js 2. In `viewer.js`:

    ```
    if (origin !== viewerOrigin && protocol !== 'blob:') {
      // throw new Error('file origin does not match viewer\'s');  // prevent this
    }
    ```
    and in viewer.html, as we do currently, 
    ```
    <script src="viewer.js"></script>

    <!-- Load Hypothesis client !-->
    <script type="application/json" class="js-hypothesis-config">
    {
      "assetRoot": "/client/",
      "sidebarAppUrl": "/client/app.html"
    }
    </script>
    <script src="/client/build/boot.js"></script>
    ```

# Updates

I've added the samples folder where I'll accumulate PDFs that are reported as anomalous and should be added to the test suite.

First: https://github.com/judell/h_puppeteer/blob/master/samples/Medieval%20Religion%20Selections.pdf. It reliably orphans in PDF.js 1 (in the stock Chrome extension), reliably works in FF and the experimental extension with PDF.js 2. 

# Summary

In this round I used 40 PDFs. They include those we've previously marked as problematic, plus a random selection of others. For each PDF I report four outcomes:

1. Test: `test.js` in Puppeteer using a Chrome extension with PDF.js v2 
2. Interactive/FF/PDF2: Firefox with its built-in PDF.js 2
3. Interactive/Chrome/PDF1: The shipping extension
4. Interactive/Chrome/PDF2: The same PDF.js v2 extension used in 1.

I've marked test results with non-zero orphans as  * (`anomaly`). 16 of 40 are so marked. In these cases I've explored why there are orphans. 6 are explained by <a href="https://github.com/hypothesis/product-backlog/issues/954">overlap</a>, 2 by the page-boundary issue. 

In 9 cases, the interactive results for Chrome with PDF.js 2 and Firefox with (a slightly newer) PDF.js, do not agree. This is puzzling. 

| code | label | count |
|--|--|--|
| * | anomaly | 16
| ** | FF/PDF2 != Chrome/PDF2 | 9
| + | <a href="https://github.com/hypothesis/product-backlog/issues/954">overlap</a> | 6
| ^ | page boundary | 2
|  | all | 40

The main purposes of this round of testing were:

1. Validate that use of Chrome/PDF2 is automatable with Puppeteer

2. Characterize the patterns that began emerging in the first round.

The number of tested PDFs is still small. My plan for round 3 is to leverage the fact that testing with both Chrome/PDF1 and Chrome/PDF2 is now automatable, and to compare results for both across a much larger randomly-selected set of annotated PDFs. We'll want to know:

- In what % of cases do they agree?

- When they disagree, how likely is it that either PDF1 or PDF2 gives the "better" result?

That would, however, leave still unanswered the question: Why the differences between FF/PDF2 and Chrome/PDF2. So before starting a large-scale test, it might be helpful for someone to review the setup here and look for issues that might explain that difference.


## * http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf

> annotations 0 (fuzzy 0, exact 0), replies 3, pagenotes 0, orphans 2, total 5

Test: 2 orphans

Interactive/FF/PDF2: No orphans

Interactive/Chrome/PDF1: No orphans

** Interactive/Chrome/PDF2: 2 orphans

Annotations on this doc suggest that we were checking it because somebody was seeing orphans at some point.

The exacts we are searching for:

> "ReflectingonthispracticeinhisbookOneEarthManyReligions,Knitterwrites,“Wehadthe WordandSpirit;theyhadsinandheathenism.",

> "Wewerethelovingdoctors;theywerethesufferingpatients",

Is the run-togetherness of the exacts a factor? If so, why would FF/PDF2 tolerate it but Chrome/PDF2 not?

## * http://jonudell.net/h/osftest.pdf

> annotations 11 (fuzzy 2, exact 9), replies 1, pagenotes 0, orphans 1, total 13

Test: 1 orphan (total 13)

Interactive/FF/PDF2: 0 orphans (total 12)

Interactive/Chrome/PDF1: 0 orphans (total 12)

Interactive/Chrome/PDF2: 0 orphans (total 12)

"BlV1TgefEeiE6oP5FZGD1Q": { "anchoredHighlight": "JAMES C. DAVIS", "outcome": null, "pageNumber": 1 },

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/BlV1TgefEeiE6oP5FZGD1Q

{"exact": "JAMES C. DAVIS", "prefix": "NUECES AND CORPUS CHRISTI BAYSBy", "type": "TextQuoteSelector", "suffix": "MAY, 2013A Thesis Paper Submitte"}]

```
<span style="left: 353.667px; top: 189.844px; font-size: 20px; font-family: sans-serif; transform: scaleX(0.954472);">IN NUECES AND CORPUS CHRISTI BAYS</span>
<span style="left: 528.5px; top: 258.844px; font-size: 20px; font-family: sans-serif; transform: scaleX(0.999429);">By</span>
<span style="left: 465.167px; top: 304.844px; font-size: 20px; font-family: sans-serif; transform: scaleX(0.960947);">JAMES C. DAVIS</span>
<span style="left: 494.167px; top: 350.844px; font-size: 20px; font-family: sans-serif; transform: scaleX(0.973326);">MAY, 2013</span>
<span style="left: 436.167px; top: 419.844px; font-size: 20px; font-family: sans-serif; transform: scaleX(0.894467);">A Thesis Paper Submitted</span>
```

Test reveals a silent failure to anchor, in all client modes. Annotation <a href="https://github.com/hypothesis/product-backlog/issues/954">overlap</a> is not a factor here. 

## http://jonudell.net/h/power-of-habit.pdf

> annotations 2 (fuzzy 0, exact 2), replies 0, pagenotes 0, orphans 0, total 2

## * http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf

> annotations 59 (fuzzy 50, exact 9), replies 39, pagenotes 3, orphans 4, total 105

Test: 4 orphans

Interactive/FF/PDF2: 4 orphans (slow to appear, require doc navigation)

Interactive/Chrome/PDF1: No orphans 

Interactive/Chrome/PDF2: 4 orphans (they appear quickly)

Sample orphan:

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/pgbFGvOmEeaOU28zzCr5uQ

PDF 1 markup

```
<div style="left: 429.918px; top: 691.003px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.903751);">communities,  curricular  programs  designed  by  faculty,  </div>
<div style="left: 429.918px; top: 708.658px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.92761);" class="">and   collaborations   between   instructional   designers   </div>
<div style="left: 429.918px; top: 726.313px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.888408);">and    students    are    becoming    increasingly    popular.    </div>
```

PDF 2 markup

```
<span style="left: 429.918px; top: 691.004px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.92172);">communities,  curricular  programs  designed  by  faculty,  </span>
<span style="left: 429.918px; top: 708.659px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.954825);" class="">and   collaborations   between   instructional   designers   </span>
<span style="left: 429.918px; top: 726.314px; font-size: 15px; font-family: sans-serif; transform: scaleX(0.915541);">and    students    are    becoming    increasingly    popular.    </span>
```

## * + ^ http://jonudell.net/h/Rhetoric_and_Crisis.pdf

> annotations 212 (fuzzy 120, exact 92), replies 11, pagenotes 1, orphans 5, total 229

Test: 5 orphans

Interactive/FF/PDF2: annotations 216, pagenotes 1, orphans 1

Interactive/Chrome/PDF1: annotations 216, pagenotes 1, orphans 1

Interactive/Chrome/PDF2: annotations 216, pagenotes 1, orphans 1

This was the seed of https://github.com/hypothesis/product-backlog/issues/954. 

The one orphan reported by all modes: 

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/gEyOdoRxEea9wK8ixCQPow

{"exact": "In class, we flipped through the yellowing pages of racist literature and the counterliterature that fought back.", "prefix": " history, albeit a painful one. ", "type": "TextQuoteSelector", "suffix": " It did indeed make the incident"}]}

This is a known failure mode. There's a pagebreak between "racist literature and" and "the counterliterature". PDF.js lazily loads into per-PDF-page HTML divs, and we only look at one of those at at time. In this case, the orphan begins on page 16 and continues on 17. 

The pages that PDF.js has loaded at this point are 15, 16, and 17. So the data we'd need to anchor this annotation does live in the DOM, and could in principle be gotten. 

Then there are the four unreported orphans. (These appear to be counted in the sidebar's Annotations tab, even though not anchored.)
  
1 https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/JEeXXoBZEeawhx-THRaiCA

{"exact": ", and", "prefix": "e explosion and subsequent spill", "type": "TextQuoteSelector", "suffix": " stopping the flow initially see"}]}

Overlaps almost exactly with this annotation that does anchor:

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/RuscgnYwEea7LwNN0ponHw

{"exact": ", and ", "prefix": "e explosion and subsequent spill", "type": "TextQuoteSelector", "suffix": "stopping the flow initially seem"}]}

2 https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/rUz5UoDYEeaqGgcYaJoSZg

{"exact": "public subjects are never single", "prefix": "st also happen within networks; ", "type": "TextQuoteSelector", "suffix": ". Therefore, becom-ing oriented "}]}

Occurs in a region of heavy overlap.

3 https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/-afq4IDeEea20kO4RMsmFw

{"exact": ", networks are not human", "prefix": "ions among elements. Furthermore", "type": "TextQuoteSelector", "suffix": "-or at least they are not merely"}]

Occurs in a region of heavy overlap.

4 https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/4qkWwoAPEeadyud9XjPFMA

{"exact": " ", "prefix": "cess necessarily sustainable? In", "type": "TextQuoteSelector", "suffix": "chapter r, I ar-gued that sustai"}]}

No overlap involved here. The target is, admittedly, just a single space. And "chapter r" is a bogus rendering of "chapter I". But the prefix is unique to the document, so it seems like it _could_ work. OTOH, PDF.js is not 100% capable of searching this rendering of a scanned PDF. The complete sentence containing the prefix is:

> "But why is this inqu iry process necessarily sustainable?"

The space in "inqu iry" is not evident to the reader. But a PDF.js search for "inquiry process necessarily" fails, whereas a search for "inqu iry process necessarily" succeeds.

## http://download.krone.at/pdf/ceta.pdf

	> annotations 26 (fuzzy 1, exact 25), replies 0, pagenotes 0, orphans 0, total 26

  ## http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf

  > annotations 14 (fuzzy 11, exact 3), replies 0, pagenotes 0, orphans 0, total 14

## * https://arxiv.org/pdf/1606.02960.pdf

> annotations 21 (fuzzy 13, exact 8), replies 2, pagenotes 0, orphans 2, total 25

Test: 21 annos, 2 orphans

Interactive/FF/PDF2: 21 annos, 2 orphans

Interactive/Chrome/PDF1: 

Interactive/Chrome/PDF2: 21 annos, 2 orphans

Same behavior everywhere. Exacts we are searching for and not finding:

  ```
	"oU86YoETEea3F2MLPRnZOA": "rhtL rhtL+BRNN(wt+1;ht;rht+1L)"
	
	"A2DBQoEWEea7_jODeE5fXQ": "We therefore foundit necessary to pre-train the model using a standard,word-level  cross-entropy  loss  as  described  in  Sec-tion 3",
  ```

## https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0168597&type=printable

> annotations 3 (fuzzy 3, exact 0), replies 3, pagenotes 5, orphans 0, total 11
"Thispaperintroducesa bibliometric,citationnetwork-basedmethodforassessingthesocialvalidationof novelresearch,andappliesthismethodtothedevelopmentofhigh-throughputtoxicologyresearchattheUSEnvironmentalProtectionAgency.Socialvalidationreferstotheacceptanceofnovelresearchmethodsbyarelevantscientificcommunity;it"
  
"Thequantitativemethodsintroducedherefindthathigh-throughputtoxicologymethodsarespreadthroughoutalargeandwell-connectedresearchcommunity,whichsuggestshighsocialvalidation"

"redandbluenodesformdistinctcommunitieswithonlyafewtiesbetweenthem,suggestingthemethodsusedbyauthorsoftheredpublicationscouldhavelowsocialvalidation.d"

##  https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf

> annotations 32 (fuzzy 1, exact 31), replies 9, pagenotes 0, orphans 0, total 41


## * http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf

> annotations 0 (fuzzy 0, exact 0), replies 0, pagenotes 1, orphans 24, total 25

Test: 24 orphans, 1 pagenote

Interactive/FF/PDF2: 24 annos, 1 pagenote

Interactive/Chrome/PDF1: 24 annos, 1 pagenote

** Interactive/Chrome/PDF2: 24 orphans, 1 pagenote

Scanned doc, 500 pages.

## https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf

> annotations 76 (fuzzy 12, exact 64), replies 19, pagenotes 0, orphans 0, total 95

## https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf

> annotations 0 (fuzzy 0, exact 0), replies 0, pagenotes 0, orphans 39, total 39

## https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf

> annotations 95 (fuzzy 1, exact 94), replies 42, pagenotes 0, orphans 4, total 141

## https://digitalpressatund.files.wordpress.com/2017/04/corinth_excavations_archaeological_manual.pdf

> annotations 0 (fuzzy 0, exact 0), replies 0, pagenotes 0, orphans 1, total 1

Test: 1 orphan

Interactive/FF/PDF2: 1 annotation

Interactive/Chrome/PDF1: 1 annotation

** Interactive/Chrome/PDF2: 1 orphan

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/GXfKqASpEeiqTaM-8ywNdQ

{"exact": "THE HARRIS MATRIX", "prefix": " on all available evidence.1.4. ", "type": "TextQuoteSelector", "suffix": "In 1975 Edward Harris published "}]}

```
<span style="left: 102px; top: 262.537px; font-size: 16.6667px; font-family: serif; transform: scaleX(1.20343);">plausible interpretation of the context based on all available </span>
<span style="left: 102px; top: 284.203px; font-size: 16.6667px; font-family: serif; transform: scaleX(1.18034);">evidence.</span>
<span style="left: 102px; top: 327.537px; font-size: 16.6667px; font-family: sans-serif; transform: scaleX(1.0595);">1.4. THE HARRIS MATRIX</span>
<span style="left: 102px; top: 370.87px; font-size: 16.6667px; font-family: serif; transform: scaleX(1.24006);">In  1975  Edward  Harris  published  and  copyrighted  the  </span>
```

## https://www.gpo.gov/fdsys/pkg/PLAW-110publ252/pdf/PLAW-110publ252.pdf

> annotations 6 (fuzzy 2, exact 4), replies 0, pagenotes 0, orphans 0, total 6

## https://valerievacchio.files.wordpress.com/2011/10/paths-of-professional-development.pdf"

> annotations 14 (fuzzy 0, exact 14), replies 0, pagenotes 0, orphans 0, total 14

All the exacts are run-together here, not a problem. 

## http://www.scu.edu.tw/philos/98class/Peng/05.pdf

> annotations 33 (fuzzy 1, exact 32), replies 0, pagenotes 0, orphans 0, total 33

## https://solaresearch.org/wp-content/uploads/2017/05/chapter4.pdf

> annotations 8 (fuzzy 3, exact 5), replies 0, pagenotes 0, orphans 0, total 8

## * http://matthematics.com/acb/appliedcalc/pdf/hofcal-chap3-all.pdf

> annotations 9 (fuzzy 4, exact 5), replies 3, pagenotes 0, orphans 1, total 13
> annotations 0 (fuzzy 0, exact 0), replies 3, pagenotes 0, orphans 10, total 13

https://jsoneditoronline.org/?url=https://hypothes.is/api/annotations/xXqiAvdTEeehXkPJ824tOQ

{"exact": "Cxdxxdxxln11", "prefix": "+=\u222bln(e)Natural Logarithm:\u222b\u222b+==\u2212", "type": "TextQuoteSelector", "suffix": "Chapter 3    The IntegralBusines"}]}

The exact is a partial extract from a math expression. 

Test: varying results

Interactive/FF/PDF2: 1 orphan
Interactive/FF/PDF2 again: no orphans

Interactive/Chrome/PDF1: no orphans

** Interactive/Chrome/PDF2: 10 orphans



## https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf

> https://rampages.us/mythfolk18/wp-content/uploads/sites/29922/2018/08/Tatar-Introduction-BatB-Anthology.pdf

## https://www.aarp.org/content/dam/aarp/livable-communities/livable-documents/documents-2018/Book-1-Roadmap-to-Livability-Web-010218.pdf

> annotations 41 (fuzzy 7, exact 34), replies 3, pagenotes 1, orphans 0, total 45

## * https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436ec20e2e72c267c6627a/1547923148732/astell_from_a_serious_proposal_to_the_ladies.pdf

> annotations 157 (fuzzy 98, exact 59), replies 65, pagenotes 0, orphans 9, total 231

Test: 9 orphans

Interactive/FF/PDF2: 5 orphans

Interactive/Chrome/PDF1: 5 orphans

Interactive/Chrome/PDF2: 5 orphans

Scanned document, all modes struggle to complete anchoring.

## * + http://aslearningdesign.net/3888/wp-content/uploads/2018/01/01-Technology-Matters.pdf

> annotations 102 (fuzzy 23, exact 79), replies 77, pagenotes 3, orphans 9, total 191

Test: 9 orphans

Interactive/FF/PDF2: 111 annotations, 3 pagenotes 

Interactive/Chrome/PDF1: 111 annotations, 3 pagenotes

Interactive/Chrome/PDF2: 111 annotations, 3 pagenotes

Small doc, heavy overlap. As elsewhere exhibiting this syndrome, the unreported orphans seem to be counted as annotations in the client's Annotations tab.

## * + http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/McCloud_Understanding_Comics.pdf

> annotations 139 (fuzzy 97, exact 42), replies 15, pagenotes 14, orphans 91, total 259

Test: 91 orphans

Interactive/FF/PDF2:  242 annos, 15 pagenotes, total 257

Interactive/Chrome/PDF1: 242 annos, 15 pagenotes, total 257

** Interactive/Chrome/PDF2: 230 annos, 15 pagenotes, 12 orphans, total 257

Extreme overlap in this case, the only selectable text being the page numbers.

## * + http://blogs.iac.gatech.edu/afterlives2018/files/2018/01/Introduction-to-Kindred.pdf

> annotations 71 (fuzzy 31, exact 40), replies 11, pagenotes 0, orphans 7, total 89

Test: 7 orphans

Interactive/FF/PDF2: 77 annos, 1 orphan

Interactive/Chrome/PDF1: 78 annos

** Interactive/Chrome/PDF2: 77 annos, 1 orphan

Scanned doc. Significant overlap

## http://bogumilkaminski.pl/files/julia_express.pdf

> annotations 0 (fuzzy 0, exact 0), replies 0, pagenotes 0, orphans 1, total 1

Test: 1 orphan

Interactive/FF/PDF2: 1 orphan

Interactive/Chrome/PDF1: 1 orphan

Interactive/Chrome/PDF2: 1 orphan

Not an anomaly, the target actually changed.

---

Test: 

Interactive/FF/PDF2: 

Interactive/Chrome/PDF1: 

Interactive/Chrome/PDF2: 

## https://www.microsoft.com/en-us/research/wp-content/uploads/2016/07/history.pdf?from=http%3A%2F%2Fresearch.microsoft.com%2Fen-us%2Fum%2Fpeople%2Fsimonpj%2Fpapers%2Fhistory-of-haskell%2Fhistory.pdf

> annotations 1 (fuzzy 0, exact 1), replies 0, pagenotes 0, orphans 0, total 1

## https://clalliance.org/wp-content/uploads/files/Quest_to_LearnMacfoundReport.pdf

> annotations 27 (fuzzy 1, exact 26), replies 0, pagenotes 0, orphans 0, total 27

## * ^ http://www.kwaldenphd.com/wp-content/uploads/2018/02/CBA-1997.pdf

> annotations 32 (fuzzy 17, exact 15), replies 0, pagenotes 0, orphans 1, total 33

Test: 1 orphan

Interactive/FF/PDF2: 32 annos, 1 orphan

Interactive/Chrome/PDF1: 33 annos

Interactive/Chrome/PDF2: 32 annos, 1 orphan

The lone orphan, target "A. Consent to Assignment", is unaffected by overlap. But it occurs at the end of a page so may run afoul of the page-boundary issue. In FF it was necessary to scroll to the page to make the orphan show up. (The test, which visits every page, forces that to happen.) Although Chrome/PDF1 reports no orphans, it actually misanchors to "en consent. No consent" which occurs at the top of the next page. 

## https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf

> annotations 39 (fuzzy 9, exact 30), replies 0, pagenotes 0, orphans 0, total 39

## * https://www.audit.vic.gov.au/sites/default/files/2018-03/20180308-Improving-Air-Quality.pdf

> annotations 0 (fuzzy 0, exact 0), replies 0, pagenotes 0, orphans 1, total 1

Test: 1 orphan

Interactive/FF/PDF2: 1 anno

Interactive/Chrome/PDF1: 1 anno

** Interactive/Chrome/PDF2: 1 orphan

There is nothing obviously unusual about the target which anchors in 2 cases, fails in 2 cases.

## * + https://educatorinnovator.org/wp-content/uploads/2019/01/when-school-is-not-enough-marsyl.pdf

> annotations 70 (fuzzy 23, exact 47), replies 49, pagenotes 2, orphans 3, total 124

Test: 70 annos, 2 pagenotes, 3 orphans, total 75

Interactive/FF/PDF2: 73 annos, 2 pagenotes, total 75

Interactive/Chrome/PDF1: 73 annos, 2 pagenotes, total 75

Interactive/Chrome/PDF2: 73 annos, 2 pagenotes, total 75

Overlap explains the orphans.

## https://kf6-stage.rit.albany.edu/attachments/56947546535c7c0709beee5c/5b439e63b985b22bc8c90547/1/CG764259_Report%20(4).pdf

> annotations 1 (fuzzy 0, exact 1), replies 0, pagenotes 0, orphans 0, total 1

## * https://www.learner.org/courses/amerhistory/pdf/text/AmHst04_Revolutionary.pdf

> annotations 7 (fuzzy 3, exact 4), replies 2, pagenotes 0, orphans 5, total 14
> annotations 0 (fuzzy 0, exact 0), replies 2, pagenotes 0, orphans 12, total 14

Test: varying results

Interactive/FF/PDF2: 12 annos

Interactive/Chrome/PDF1: 12 annos

Interactive/Chrome/PDF2: 12 orphans

## * https://newclasses.nyu.edu/access/content/group/81e3bb2a-f53e-41f2-a2bd-9c1d43e1a545/07islandsofexpertise.pdf

> annotations 2 (fuzzy 0, exact 2), replies 29, pagenotes 2, orphans 40, total 73

Test: 2 annos, 2 page notes, 40 orphans 

Interactive/FF/PDF2: 42 annos, 2 pagenotes

Interactive/Chrome/PDF1: 42 annos, 2 pagenotes

Interactive/Chrome/PDF2: 42 annos, 2 pagenotes

On the anomaly between test and the 3 interactive modes: The test result can appear interactively, at first, and then morphs on page refresh.

(Note: In Chrome/PDF1: Uncaught (in promise) DOMException in pdf.js)

## https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf

> annotations 76 (fuzzy 12, exact 64), replies 19, pagenotes 0, orphans 0, total 95

## http://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf

> annotations 32 (fuzzy 1, exact 31), replies 9, pagenotes 0, orphans 0, total 41

## https://jonudell.info/h/ee12.pdf

> annotations 2 (fuzzy 0, exact 2), replies 0, pagenotes 2, orphans 0, total 4
