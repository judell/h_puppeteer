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

# Notes

## https://arxiv.org/pdf/1606.02960.pdf

One of the orphans, https://hyp.is/oU86YoETEea3F2MLPRnZOA, is a genuine mismatch.

The other, https://hyp.is/A2DBQoEWEea7_jODeE5fXQ/arxiv.org, is a case where the selection crosses a page boundary. This is guaranteed to fail right now, since we don't handle that case. (https://github.com/hypothesis/client/issues/266#issuecomment-293700083)

## http://jonudell.net/h/Rhetoric_and_Crisis.pdf

The test reports a few more orphans than the client does. At first I assumed this was a problem with the test, but it is actually a problem with the client. See https://github.com/hypothesis/product-backlog/issues/954
