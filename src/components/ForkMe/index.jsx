export const ForkMe = ({
  href = 'https://github.com/chnirt/vite-firebase-chat-app',
  size = 149
}) => {
  return (
    <a
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
      }}
      href={href}
    >
      <img
        loading="lazy"
        width={size}
        height={size}
        src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149"
        className="attachment-full size-full"
        alt="Fork me on GitHub"
        data-recalc-dims={1}
      />
    </a>
  )
}
