export const ForkMe = () => {
  return (
    <a
      style={{
        position: 'absolute',
        top: 60,
        right: 0,
        zIndex: 20,
      }}
      href={'https://github.com/chnirt/vite-firebase-chat-app'}
    >
      <img
        style={{
          height: '10vh',
        }}
        // loading="lazy"
        src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149"
        className="attachment-full size-full"
        alt="Fork me on GitHub"
      />
    </a>
  )
}
