import { Button, Empty, Typography } from 'antd'

export const EmptyChat = () => {
  return (
    <Empty
      // image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      imageStyle={{
        height: 60,
      }}
      description={
        <div>
          <Typography.Title level={4}>Your Messages</Typography.Title>
          <Typography.Text type="secondary">
            Send private photos and messages to a friend or group.
          </Typography.Text>
        </div>
      }
    >
      <Button
        type="primary"
        style={{
          backgroundColor: '#0095f6',
          borderColor: '#0095f6',
          borderRadius: 4,
        }}
      // onClick={handleNewMessage}
      >
        Send Message
      </Button>
    </Empty>
  )
}
