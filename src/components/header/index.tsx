import style from './index.module.scss'
import logo from '@/assets/logo.png'

export const Header = () => {
  return (
    <div className={style.header}>
      <img src={logo} className={style.logo} />
      GPT Shortcut
    </div>
  )
}
