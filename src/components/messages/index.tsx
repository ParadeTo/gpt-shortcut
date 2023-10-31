import {UserOutlined} from '@ant-design/icons'
import cn from 'classnames'
import style from './index.module.scss'
import chatgpt from '@/assets/chatgpt.png'

const Message = ({text, role}) => {
  const isUser = role === 'user'
  return (
    <div className={cn(style.message, {[style.user]: role === 'user'})}>
      {isUser ? (
        <UserOutlined rev className={style.img} />
      ) : (
        <img src={chatgpt} className={style.img} />
      )}
      <span className={style.text}>{text}</span>
    </div>
  )
}

export const Messages = () => {
  const messages = [
    {
      role: 'user',
      text: 'asdgaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdg',
    },
    {role: 'ai', text: 'kdkdkdkdkddd'},
    {
      role: 'user',
      text: 'asdgaddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddsdg',
    },
    {role: 'ai', text: 'kdkdkdkdkddd'},
  ]
  return (
    <div className={style.messages}>
      {messages.map((m, i) => (
        <Message key={i} {...m} />
      ))}
    </div>
  )
}
