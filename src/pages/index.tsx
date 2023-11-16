import {ReactNode} from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './app'
import {QuickWindow} from './quickWindow'
import {Proxy} from './proxy'

let root = document.getElementById('root') as HTMLElement

const pages: {[k: string]: ReactNode} = {
  proxy: <Proxy />,
}
const search = new URLSearchParams(location.search)
const page = search.get('page') as string
ReactDOM.createRoot(root).render(pages[page])
