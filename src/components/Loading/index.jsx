import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />


export const Loading = ({
  style,
  spinning = false,
  children,
}) => {
  if (typeof children === 'undefined')
    return (
      <div
        className='appHeight'
        style={{
          width: '100vw',
          // height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff70',
          zIndex: 1001,
        }}
      >
        <Spin indicator={antIcon} />
      </div>
    )

  return (
    <Spin
      style={{
        height: '100vh',
        maxHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff70',
        zIndex: 1001,
        ...style
      }}
      spinning={spinning}
      indicator={antIcon}
    >
      {children}
    </Spin>
  )
}
