import {MessageType} from '@/pages/proxy'
import {v4 as uuid} from 'uuid'

interface Paragraph {
  id: string
  commonAncestorEl: HTMLElement // 多个 Text 节点的公共祖先节点
  textNodes: Node[] // 当前段落包含的 Text 节点
  text: string
  translationEl: HTMLElement
  translationWrapperEl: HTMLElement
}

export class ParallelTranslate {
  excludeSelector = ['code']
  toBeTranslateTag = 'to-be-translate'
  translateExcludeTag = 'translate-exclude'
  translationWrapperTag = 'translation-wrapper'
  translationTag = 'translation'
  translationNodeAncestorAttr = 'translation-node-ancestor'
  injectStyleEl = 'inject-style-el'
  loadingClass = 'loading-class'
  translationClass = 'translation-class'

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
      translationEl.classList.add(this.loadingClass),
      translationWrapperEl.appendChild(translationEl),
      {
        translationWrapperEl,
        translationEl,
      }
    )
  }

  insertLoadingStyle() {}

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

  insertCSS() {
    if (document.querySelector(`[${this.injectStyleEl}]`)) return
    const style = document.createElement('style')
    this.setAttr(style, this.injectStyleEl)
    style.innerText = `
.${this.loadingClass} {
  width: 12px;
  height: 12px;
  vertical-align: middle;
  display: inline-block;
  margin: 0 4px;
  border: 2px solid #673AB7;
  border-top-color: rgba(0, 0, 0, 0.1);
  border-right-color: rgba(0, 0, 0, 0.1);
  border-bottom-color: rgba(0, 0, 0, 0.1);
  border-radius: 100%;
  animation: monica-translate-loading-circle-animation infinite 0.75s linear;
}
@keyframes monica-translate-loading-circle-animation {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.${this.translationClass} {
  background-repeat: repeat-x;
  background: linear-gradient( to right, #673AB7 0%, #9C27B0 50%, transparent 50%, transparent 100% ) repeat-x left bottom;
  background-size: 4px 1px;
  padding-bottom: 2px;
}
`
    // background: linear-gradient( to right, #5083e4 0%, #5083e4 50%, transparent 50%, transparent 100% ) repeat-x left bottom;
    // background-size: 8px 2px;
    document.head.appendChild(style)
  }

  async translate($proxyIframe: HTMLIFrameElement) {
    this.insertCSS()
    this.markExclude()
    const textNodes = this.findTextNodes()
    const paragraphs = this.createParagraphs(textNodes)

    const texts: string[] = []
    paragraphs.forEach(
      ({commonAncestorEl, text, translationWrapperEl, translationEl}) => {
        commonAncestorEl.appendChild(translationEl)
        texts.push(text)
      }
    )

    const results = await this.requestAI(texts, $proxyIframe)
    paragraphs.forEach(({translationEl}, index) => {
      translationEl.innerText = results[index]
      translationEl.classList.remove(this.loadingClass)
      translationEl.classList.add(this.translationClass)
    })
  }

  parseJson(answer: string) {
    const re = /.*```json([\s\S]*)```.*/.exec(answer)
    const jsonStr = re[1].trim()
    return JSON.parse(jsonStr)
  }

  requestAI(
    texts: string[],
    $proxyIframe: HTMLIFrameElement
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const from = 'Chinese'
      const to = 'English'
      let answer = ''
      window.addEventListener('message', (ev) => {
        const msg = ev.data
        console.debug('msg:', msg)
        if (msg.target !== 'parallelTranslate') return

        if (msg.event === MessageType.updateAnswer) {
          answer = msg.message
        } else if (msg.event === MessageType.done) {
          try {
            const result = this.parseJson(answer)
            resolve(result)
          } catch (error) {
            reject()
          }
        } else if (msg.error) {
          reject()
        }
      })
      $proxyIframe.contentWindow?.postMessage(
        {
          prompt: `I will give you a JSON array, please translate each item from ${from} to ${to} and return a JSON array whose items are translation result string, please return the JSON directly, here is my JSON array:
          ${JSON.stringify(texts)}`,
        },
        '*'
      )
    })
  }
}
