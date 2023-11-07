import {v4 as uuid} from 'uuid'
interface Paragraph {
  id: string
  commonAncestorEl: HTMLElement // 多个 Text 节点的公共祖先节点
  textNodes: Node[] // 当前段落包含的 Text 节点
  text: string
  translationEl: HTMLElement
  translationWrapperEl: HTMLElement
}

class ParallelTranslate {
  excludeSelector = ['code']
  toBeTranslateTag = 'to-be-translate'
  translateExcludeTag = 'translate-exclude'
  translationWrapperTag = 'translation-wrapper'
  translationTag = 'translation'
  translationNodeAncestorAttr = 'translation-node-ancestor'

  createTranslatableNodeWrapper(textNode: Text) {
    const translatableEl = document.createElement(this.toBeTranslateTag)
    textNode.after(translatableEl)
    translatableEl.appendChild(textNode)
    return translatableEl
  }

  findTextNodes() {
    const textNodes = []
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return this.isMarkAttr(node as HTMLElement, this.translateExcludeTag)
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_SKIP
        }
        return NodeFilter.FILTER_ACCEPT
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

  setAttr(el: HTMLElement, attr: string, value = 't') {
    el.setAttribute(attr, value)
  }

  isMarkAttr(el: HTMLElement, attr: string, value = 't') {
    return el.getAttribute(attr) === value
  }

  markExclude() {
    this.excludeSelector.forEach((selector) => {
      document.body.querySelectorAll(selector).forEach((el) => {
        this.setAttr(el as HTMLElement, this.translateExcludeTag)
      })
    })
  }

  isInlineEl(e: HTMLElement) {
    const {display} = window.getComputedStyle(e)
    return ['inline'].includes(display)
  }

  getBlockAncestorEl(e: HTMLElement): HTMLElement {
    if (e.tagName === 'BODY') return e
    return this.isBlockEl(e!) || e?.tagName === 'BODY'
      ? e!
      : this.getBlockAncestorEl(e.parentElement!)
  }

  isBlockEl(e: HTMLElement) {
    return !this.isInlineEl(e)
  }

  createTranslationEl() {
    const translationWrapperEl = document.createElement(
      this.translationWrapperTag
    )
    const translationEl = document.createElement(this.translationTag)
    return (
      translationEl.classList.add('translation-loading'),
      translationWrapperEl.appendChild(translationEl),
      {
        translationWrapperEl,
        translationEl,
      }
    )
  }

  createParagraphs(textNodes: Node[]) {
    const paragraphs: Paragraph[] = []
    for (const textNode of textNodes) {
      const blockAncestorEl = this.getBlockAncestorEl(textNode.parentElement!)
      const paragraph = paragraphs.find(
        (p) => p.commonAncestorEl === blockAncestorEl
      )
      if (paragraph) {
        paragraph.textNodes.push(textNode)
        paragraph.text += textNode.textContent
      } else {
        const {translationEl, translationWrapperEl} = this.createTranslationEl()
        this.setAttr(blockAncestorEl, this.translationNodeAncestorAttr)
        paragraphs.push({
          id: uuid(),
          commonAncestorEl: blockAncestorEl,
          textNodes: [textNode],
          text: textNode.textContent!,
          translationWrapperEl,
          translationEl,
        })
      }
    }
    return paragraphs
  }

  translate() {
    this.markExclude()
    const textNodes = this.findTextNodes()
    const paragraphs = this.createParagraphs(textNodes)
    paragraphs.forEach(
      ({commonAncestorEl, text, translationWrapperEl, translationEl}) => {
        translationEl.innerText = text.trim()
        translationEl.style.cssText = `
      background-repeat: repeat-x;
      background: linear-gradient( to right, #673AB7 0%, #9C27B0 50%, transparent 50%, transparent 100% ) repeat-x left bottom;
      background-size: 4px 1px;
      padding-bottom: 2px;`
        commonAncestorEl.appendChild(translationEl)
      }
    )
  }
}

new ParallelTranslate().translate()
