import Browser from 'webextension-polyfill'
import {v4 as uuid} from 'uuid'
import {createParser} from 'eventsource-parser'

// async function saveData<T>(key: string, data: T) {
//   await Browser.storage.local.set({[key]: data})
// }

// async function loadData(key: string) {
//   const {[key]: value} = await Browser.storage.local.get(key)
//   return value
// }

interface OnEventParams {
  type: 'updateAnswer' | 'done'
  data?: any
}

type ResponseContent =
  | {
      content_type: 'text'
      parts: string[]
    }
  | {
      content_type: 'code'
      text: string
    }
  | {
      content_type: 'tether_browsing_display'
      result: string
    }

function removeCitations(text: string) {
  return text.replaceAll(/\u3010\d+\u2020source\u3011/g, '')
}

export class ChatGPTBot {
  accessToken?: string
  async getAccessToken(): Promise<string> {
    // const tokenObj = await loadData('accessToken')
    // if (tokenObj?.accessToken && new Date(tokenObj?.expires) > new Date()) {
    //   return tokenObj.accessToken
    // }

    const resp = await fetch('https://chat.openai.com/api/auth/session')
    if (resp.status === 403) {
      throw new Error('getAccessToken: 403')
    }
    const data = await resp.json().catch(() => ({}))
    if (!data.accessToken) {
      throw new Error('getAccessToken: no accessToken')
    }
    this.accessToken = data.accessToken
    // saveData('accessToken', data)
    return data.accessToken
  }

  async *streamAsyncIterable(stream: ReadableStream) {
    const reader = stream.getReader()
    try {
      while (true) {
        const {done, value} = await reader.read()
        if (done) {
          return
        }
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }

  async parseSSEResponse(resp: Response, onMessage: (message: string) => void) {
    if (!resp.ok) {
      const error = await resp.json().catch(() => null)
      if (!error) {
        throw new Error(JSON.stringify(error))
      }
      throw new Error(`${resp.status} ${resp.statusText}`)
    }
    const parser = createParser((event) => {
      if (event.type === 'event') {
        onMessage(event.data)
      }
    })
    const decoder = new TextDecoder()
    for await (const chunk of this.streamAsyncIterable(resp.body!)) {
      const str = decoder.decode(chunk)
      parser.feed(str)
    }
  }

  async sendMessage(params: {
    prompt: string
    onEvent: (p: OnEventParams) => void
  }) {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken()
    }

    const rsp = await fetch(
      'https://chat.openai.com/backend-api/conversation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          action: 'next',
          messages: [
            {
              id: uuid(),
              author: {role: 'user'},
              content: {
                content_type: 'text',
                parts: [params.prompt],
              },
            },
          ],
          model: 'text-davinci-002-render-sha',
          conversation_id: null,
          parent_message_id: uuid(),
          // arkose_token: arkoseToken,
        }),
      }
    )

    this.parseSSEResponse(rsp, (message) => {
      console.log('msg', message)
      if (message === '[DONE]') {
        params.onEvent({type: 'done'})
        return
      }
      let data
      try {
        data = JSON.parse(message)
      } catch (err) {
        console.error(err)
        return
      }
      const content = data.message?.content as ResponseContent | undefined
      if (!content) {
        return
      }
      let text: string
      if (content.content_type === 'text') {
        text = content.parts[0]
        text = removeCitations(text)
      } else if (content.content_type === 'code') {
        text = '_' + content.text + '_'
      } else {
        return
      }
      if (text) {
        params.onEvent({
          type: 'updateAnswer',
          data: {text},
        })
      }
    })
  }
}
