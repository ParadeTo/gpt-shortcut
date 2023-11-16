import {ChatGPTBot} from '@/chatgpt'
import {MessageType} from '@/pages/proxy'
import Browser from 'webextension-polyfill'
import {ParallelTranslate} from './ParallelTranslate'

const parallelTranslate = new ParallelTranslate()

function insertProxy() {
  const container = document.createElement('div')
  const shadow = container.attachShadow({mode: 'open'})
  const iframeEl = document.createElement('iframe')
  container.id = 'botProxyContainer'
  iframeEl.id = 'botProxy'
  iframeEl.sandbox = 'allow-scripts allow-popups allow-same-origin'
  iframeEl.style = `display:none`
  iframeEl.src = Browser.runtime.getURL('index.html?page=proxy')
  shadow.appendChild(iframeEl)
  document.body.appendChild(container)
  return iframeEl
}
const $proxyIframe = insertProxy()

window.addEventListener('message', (e) => {
  if (e.data.event === MessageType.proxyReady) {
    parallelTranslate.translate($proxyIframe)
  }
})
