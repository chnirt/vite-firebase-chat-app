export const env = import.meta.env

// export const basename = encodeURIComponent('👾')
export const basename = ''

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
  spotify: 'spotify',
  setting: 'setting',
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
}
