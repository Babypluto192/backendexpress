
export type loginUserModel = 
   /**
   * needed data to login
   */
  | {login: string, email?: string ,password: string }
  | {email: string,login?: string, password: string }
