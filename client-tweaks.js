// serving the tweaked client from http://hyp.jonudell.info:3001/hypothesis

// bookmarklet for firefox

javascript:(function(){window.hypothesisConfig=function(){return{showHighlights:true,appType:'bookmarklet'};};var d=document,s=d.createElement('script');s.setAttribute('src','http://hyp.jonudell.info:3001/hypothesis');d.body.appendChild(s)})();

// sidebar

function formatAnnot(ann) {
  return {
    tag: ann.$tag,
    msg: {
      document: ann.document,
      target: ann.target,
      uri: ann.uri,
      id: ann.id, // pass the id
    }
  };
}

// this version aims to make the pageIds available so highlights can be pagemapped and traversed in proper order

// highlighter/dom-wrap-highlighter/index.coffee

exports.highlightRange = function(normedRange, cssClass, id) {
  console.log(`id ${id}`)
  var hl, nodes, white;
  if (cssClass == null) {
    cssClass = 'annotator-hl';
  }
  white = /^\s*$/;
  nodes = $(normedRange.textNodes()).filter(function(i) {
    return !white.test(this.nodeValue);
  });
  try {
    let pageId = document.querySelectorAll('hypothesis-highlight')[0].parentElement.closest('.page').id
    hl = $(`<hypothesis-highlight pageId="${pageId}" class="${cssClass} h_${id}"></hypothesis-highlight>`);
    console.log(hl)
  } catch (e) {
    hl = $(`<hypothesis-highlight class="${cssClass} h_${id}"></hypothesis-highlight>`);
    console.error(e)
  }
  return nodes.wrap(hl).parent().toArray();
};

// guest.coffee

highlight = function(anchor) {
  if (anchor.range == null) {
    return anchor;
  }
  return animationPromise(function() {
    var highlights, normedRange, range;
    range = xpathRange.sniff(anchor.range);
    normedRange = range.normalize(root);
    highlights = highlighter.highlightRange(normedRange, null, annotation.id); // pass the id 
    $(highlights).data('annotation', anchor.annotation);
    anchor.highlights = highlights;
    return anchor;
  });
};
