export const env = import.meta.env

export const basename = encodeURIComponent('👾')
// export const basename = ''

export const paths = {
  login: 'login',
  register: 'register',
  home: '/',
  userDetail: '/user/:username',
  createBlog: 'create-blog',
  blog: 'blog',
  blogDetail: 'blog/:blogId',
  whatsapp: 'whatsapp',
  pexels: 'pexels',
  search: 'search',
  messenger: 'messenger',
  audioPlayer: 'audioPlayer',
  thirdweb: 'thirdweb',
  nftMarketplace: 'nft-marketplace',
  createNFT: 'create-nft',
  myNFTs: 'my-nfts',
  profile: 'profile',
  changePassword: 'change-password',
  spotify: 'spotify',
  notFound: '*',
}

export const eventNames = {
  pageView: 'page_view',
  login: 'login',
  register: 'register',
  createBlog: 'create_blog',
  deleteBlog: 'delete_blog',
  call: 'call',
  answer: 'answer',
  decline: 'decline',
  createPhoto: 'create_photo',
  editAvatar: 'edit_avatar',
  editProfile: 'edit_profile',
  changePassword: 'change_password',
}

export const avatarPlaceholder =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl5Q6_xZ46DYo8CxlI7v-NyYi7KGCzG59GcOIU9XOFngbJ0S2te7CnU9vYiGHi5pWyvYk&usqp=CAU'

export const colors = {
  spotify: '#18d860',
  firebase: '#FFCA28',
  border: '#767676',
  select: '#000000',
}
