# Results

|Chrome / PDF.js 1|Firefox / PDF.js 2 
|---|-
| http://download.krone.at/pdf/ceta.pdf | http://download.krone.at/pdf/ceta.pdf 
|fuzzy 1, exact 25, orphan 0, total 26 | fuzzy 1, exact 25, orphan 0, total 26 | 
|http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf | http://wendynorris.com/wp-content/uploads/2018/12/Csikszentmihaly-and-Rochberg-Halton-1981-The-Meaning-of-Things-Domestic-Symbols-and-the-Self.pdf 
|fuzzy 2, exact 12, orphan 0, total 14 | fuzzy 11, exact 3, orphan 0, total 14
| https://arxiv.org/pdf/1606.02960.pdf | https://arxiv.org/pdf/1606.02960.pdf 
| fuzzy 8, exact 13, orphan 2, total 23 |  fuzzy 13, exact 8, orphan 2, total 23
 https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf |https://twiki.cin.ufpe.br/twiki/pub/TAES/TAES2201502/295251F9-8935-4D0A-B6D3-112E91E22E44.pdf 
| fuzzy 1, exact 31, orphan 0, total 32 | fuzzy 1, exact 31, orphan 0, total 32
| http://jonudell.net/h/Rhetoric_and_Crisis.pdf | http://jonudell.net/h/Rhetoric_and_Crisis.pdf
| fuzzy 55, exact 157, orphan 4, total 216 |  fuzzy 126, exact 86, orphan 4, total 216
| http://jonudell.net/h/power-of-habit.pdf | http://jonudell.net/h/power-of-habit.pdf
| fuzzy 1, exact 1, orphan 0, total 2 | 
| http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf | http://jonudell.net/h/Knowledge%20of%20Interfaith%20Leader.pdf
| fuzzy 1, exact 1, orphan 0, total 2 | fuzzy 1, exact 1, orphan 0, total 2
| http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf | http://cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf
| fuzzy 21, exact 41, orphan 1, total 63 | fuzzy 50, exact 9, orphan 4, total 63
| http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf | http://www.inp.uw.edu.pl/mdsie/Political_Thought/Plato-Republic.pdf
| fuzzy 16, exact 8, orphan 0, total 24 | fuzzy 1, exact 23, orphan 0, total 24
|https://blog.ufes.br/kyriafinardi/files/2017/10/What-Video-Games-Have-to-Teach-us-About-Learning-and-Literacy-2003.-ilovepdf-compressed.pdf |
| fuzzy 13, exact 49, orphan 0, total 62 | fuzzy 10, exact 52, orphan 0, total 62
| https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf | https://dspace.lboro.ac.uk/dspace-jspui/bitstream/2134/19987/3/979909.pdf
| fuzzy 5, exact 34, orphan 0, total 39 | fuzzy 11, exact 28, orphan 0, total 39
| https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf | https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf
| fuzzy 1, exact 94, orphan 5, total 100 | fuzzy 1, exact 94, orphan 5, total 100

# Notes

## https://arxiv.org/pdf/1606.02960.pdf

One of the orphans, https://hyp.is/oU86YoETEea3F2MLPRnZOA, is a genuine mismatch.

The other, https://hyp.is/A2DBQoEWEea7_jODeE5fXQ/arxiv.org, is a case where the selection crosses a page boundary. This is guaranteed to fail right now, since we don't handle that case. (https://github.com/hypothesis/client/issues/266#issuecomment-293700083)

## http://jonudell.net/h/Rhetoric_and_Crisis.pdf

The test reports a few more orphans than the client does. At first I assumed this was a problem with the test, but it is actually a problem with the client. See https://github.com/hypothesis/product-backlog/issues/954

## cdn.nmc.org/media/2017-nmc-horizon-report-he-EN.pdf

One of the orphans: 

https://hypothes.is/api/annotations/pgbFGvOmEeaOU28zzCr5uQ

- exact	:	collaborations between instructional designers and students
- prefix	:	ograms designed by faculty, and 
- suffix	:	 are becoming increasingly popul

Which seems like it'd map unproblematically, in this born-digital document, to:

&lt;div data-canvas-width="354.24" style="left: 429.918px; top: 708.658px; font-size: 15px; font-family: sans-serif; transform: scaleX(1.04124);">and &lt;hypothesis-highlight class="annotator-hl">collaborations between instructional designers &lt;/hypothesis-highlight>&lt;/div>
&lt;div data-canvas-width="356.29799999999994" style="left: 429.918px; top: 726.313px; font-size: 15px; font-family: sans-serif; transform: scaleX(1.09281);">&lt;hypothesis-highlight class="annotator-hl">and students&lt;/hypothesis-highlight> are becoming increasingly popular. &lt;/div>

The others appear similar. 

## https://static1.squarespace.com/static/53713bf0e4b0297decd1ab8b/t/5c436dd70ebbe823a7899bd8/1547922905657/braidotti_a_theoretical_framework_for_critical_posthumanities.pdf

More examples of unreported orphans. They are: 

Object {id: "xqdiWiUfEemDRYO41_0oiQ", page: undefined, outcome: "orphan"}
Object {id: "h3L_xiTzEemcPdPjKPP4AA", page: undefined, outcome: "orphan"}
Object {id: "eSx1biQrEem_H0uQ1keNYQ", page: undefined, outcome: "orphan"}
Object {id: "5iH8UiT4EemI6qtMD5lVww", page: undefined, outcome: "orphan"}

I find that in all these cases, the target of the unreported orphan overlaps the target of one or more anchored annotations. I have updated https://github.com/hypothesis/product-backlog/issues/954 accordingly.