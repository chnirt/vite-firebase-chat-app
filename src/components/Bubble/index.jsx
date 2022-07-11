export const Bubble = ({ type = 'message', placement = 'left', text = '' }) => {
  const isLeft = placement === 'left'
  const isMessage = type === 'message'

  if (isMessage)
    return (
      <div
        style={{
          padding: 16,
          minHeight: 44,
          borderRadius: 22,
          border: '1px solid #EFEFEF',
          backgroundColor: isLeft ? '#FFFFFF' : '#efefef',
        }}
      >
        {text}
      </div>
    )

  return null
}
