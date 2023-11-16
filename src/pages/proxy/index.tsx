import {ChatGPTBot} from '@/chatgpt'
import {useEffect} from 'react'

export enum MessageType {
  proxyReady,
  updateAnswer,
  done,
}

const chatgpt = new ChatGPTBot()

export const Proxy = () => {
  useEffect(() => {
    window.addEventListener('message', async (args) => {
      const prompt = args.data.prompt
      if (prompt) {
        chatgpt.sendMessage({
          prompt,
          onEvent(event) {
            window.parent.postMessage(event, '*')
          },
        })
      }
    })
    window.parent.postMessage({event: MessageType.proxyReady}, '*')
  }, [])
  return null
}
