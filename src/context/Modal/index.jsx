import { Form } from 'antd'
import {
  createContext,
  useContext,
  useState,
  FunctionComponent,
  useMemo,
} from 'react'

const defaultState = {
  form: {},
  visible: false,
  show: () => { },
  hide: () => { },
}

const ModalContext = createContext(defaultState)

export const ModalProvider = ({
  children,
}) => {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)

  const value = useMemo(
    () => ({
      form,
      visible,
      show: () => setVisible(true),
      hide: () => setVisible(false),
    }),
    [form, visible]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export const useModal = () => useContext(ModalContext)
