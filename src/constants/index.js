export const env = import.meta.env

export const basename = encodeURIComponent('👾')

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
  profile: 'profile',
  changePassword: 'change-password',
  notFound: '*',
}

export const eventNames = {
  login: 'login',
  register: 'register',
  createBlog: 'create_blog',
  deleteBlog: 'delete_blog',
  call: 'call',
  answer: 'answer',
  decline: 'decline',
  createPhoto: 'create_photo',
}
