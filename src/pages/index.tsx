import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './app'
import {QuickWindow} from './quickWindow'
import {Proxy} from './proxy'

let root = document.getElementById('root') as HTMLElement

const pages = {
  proxy: Proxy,
}

if (location.search.indexOf('quickWindow') > -1) {
  ReactDOM.createRoot(root).render(<QuickWindow />)
} else {
  console.log(1)
  ReactDOM.createRoot(root).render(<App />)
}
