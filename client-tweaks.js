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

// annotator

exports.highlightRange = function(normedRange, cssClass, id) {
  var hl, nodes, white;
  if (cssClass == null) {
    cssClass = 'annotator-hl';
  }
  white = /^\s*$/;
  hl = $(`<hypothesis-highlight class="${cssClass} h_${id}"></hypothesis-highlight>`);
  nodes = $(normedRange.textNodes()).filter(function(i) {
    return !white.test(this.nodeValue);
  });
  let firstNode = Array.from(nodes)[0]
  let page = firstNode.parentElement.closest('.page')
  let pageId = page.id ? page.id : 'pageContainer1'
//  console.log(firstNode, page, page.id)
  hl = $(`<hypothesis-highlight pageId="${page.id}" class="${cssClass} ${id}"></hypothesis-highlight>`); // add the id
  return nodes.wrap(hl).parent().toArray();
};



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
