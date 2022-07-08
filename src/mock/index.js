import { DEV } from "../env"

export const signInAccount = {
  emailOrYourPhoneNumber: DEV ? 'trinhchinchin@gmail.com' : '',
  password: DEV ? 'Admin@123' : '',
  remember: false,
}

export const signUpAccount = {
  fullName: DEV ? 'Trịnh Chin Chin' : '',
  emailOrYourPhoneNumber: DEV ? 'trinhchinchin@gmail.com' : '',
  username: DEV ? 'trinhchinchin' : '',
  password: DEV ? 'Admin@123' : '',
}
