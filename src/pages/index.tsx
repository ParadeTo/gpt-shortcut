import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './app'
import {QuickWindow} from './quickWindow'

let root = document.getElementById('root') as HTMLElement

if (location.search.indexOf('quickWindow') > -1) {
  ReactDOM.createRoot(root).render(<QuickWindow />)
} else {
  console.log(1)
  ReactDOM.createRoot(root).render(<App />)
}
