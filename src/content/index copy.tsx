import {Button} from 'antd'
import './index.scss'
import {createRoot} from 'react-dom/client'

const Comp = () => {
  return (
    <div className='my-container'>
      <Button>click me</Button>
    </div>
  )
}

const div = document.createElement('div')
document.body.appendChild(div)
const root = createRoot(div)
root.render(<Comp />)

// Get the URL of the manifest.json file
const manifestURL = chrome.runtime.getURL('manifest.json')
debugger
// Create an XMLHttpRequest object
const xhr = new XMLHttpRequest()

// Open a GET request to the manifest.json file
xhr.open('GET', manifestURL, true)

// Set the response type to 'text'
xhr.responseType = 'text'

// Define the onload event handler
xhr.onload = function () {
  if (xhr.status === 200) {
    // Parse the JSON content of the manifest.json file
    const manifest = JSON.parse(xhr.responseText)

    // Access the manifest content
    console.log(manifest)
  }
}

// Send the request
xhr.send()
