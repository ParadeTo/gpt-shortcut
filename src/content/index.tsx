class ParallelTranslate {
  createTranslatableNodeWrapper(textNode: Text) {
    const translatableEl = document.createElement('to-be-translate')
    textNode.after(translatableEl)
    translatableEl.appendChild(textNode)
    return translatableEl
  }
  findTextNodes() {
    const textNodes = []
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_SKIP
      }
    )
    let node = walker.nextNode()
    while (node) {
      if (node.textContent?.trim()) {
        textNodes.push(node)
      }
      node = walker.nextNode()
    }

    return textNodes
  }

  translate() {
    const textNodes = this.findTextNodes()
    textNodes.forEach((textNode) => {
      const $transltedNode = document.createElement('translation')
      $transltedNode.innerText = textNode.textContent!
      $transltedNode.style.cssText = `
      background-repeat: repeat-x;
      background: linear-gradient( to right, #673AB7 0%, #9C27B0 50%, transparent 50%, transparent 100% ) repeat-x left bottom;
      background-size: 4px 1px;
      padding-bottom: 2px;`
      textNode.after($transltedNode)
    })
  }
}

new ParallelTranslate().translate()
