
import { ObjectId } from "mongodb"

export type bookDb = {
  id: number,
  title: string 
}


export type userDbType = {
  _id:  ObjectId,
  login: string,
  email: string,
  pasword:string,
  createdDate: Date,
  mailConfirmation: mailConfirmation,
  recoveryCode: recoveryCode
}

export type mailConfirmation = {
  confirmationCode: {
    code: string,
    expiringDate: Date
  }
  confirmed: boolean
}

export type recoveryCode = {
  code: string,
  expiringDate: Date
  used: boolean
}

export type refreshTokenMeta = {
    userId: ObjectId,
    createdData: number,
    deviceId: string,
    ipAdress: string,
    deviceName: string | undefined
}
