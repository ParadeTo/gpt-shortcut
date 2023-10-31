import {Button, Input, Select, Space} from 'antd'
import style from './index.module.scss'
export const ChatInput = () => {
  return (
    <div className={style.chatInput}>
      <Space.Compact style={{width: '100%'}}>
        <Input size='large' placeholder='input question' />
        <Button size='large' type='primary'>
          Send
        </Button>
      </Space.Compact>
    </div>
  )
}
