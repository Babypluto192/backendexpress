import { ObjectId } from "mongodb"
import { mailConfirmation, recoveryCode } from "./dbTypes"


export type userType = {
  _id:  ObjectId,
  login: string,
  email: string,
  pasword:string,
  createdDate: Date,
  mailConfirmation: mailConfirmation
}

export type userTypeWithRecovery = {
  _id:  ObjectId,
  login: string,
  email: string,
  pasword:string,
  createdDate: Date,
  mailConfirmation: mailConfirmation,
  recoveryCode: recoveryCode
}

export type refreshTokenMetaService = {
    userId: ObjectId,
    createdData: number,
    deviceId: string,
    ipAdress: string,
    deviceName: string | undefined
}
