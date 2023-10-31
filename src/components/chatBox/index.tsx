import {ChatInput} from '../chatInput'
import {Header} from '../header'
import {Messages} from '../messages'
import style from './index.module.scss'
export const ChatBot = () => {
  return (
    <div className={style.chatBox}>
      <Header />
      <Messages />
      <ChatInput />
    </div>
  )
}
