import { ObjectId } from "mongodb";
import { tokenModel, userModel } from "../db";
import { userType, userTypeWithRecovery } from "../types/userType";
import { recoveryCode, refreshTokenMeta, userDbType } from "../types/dbTypes";



  export interface userRepositoryInterface {
    createUser(newUser: userType): Promise<ObjectId>,
    findUserById(id: ObjectId):Promise<userType | null>,
    findUserByLoginOrEmail(login?: string, email?: string): Promise<userType | null>,
    findUserByAccountConfirmationCode(code: string): Promise<userDbType | null>,
    confirmUser(user: userDbType): Promise<boolean>,
    changePassword(new_password: string, id: ObjectId): Promise<boolean>,
    addCode(recoveryCode: recoveryCode, user:userType): Promise<boolean>,
    findUserByRecoveryCode(recoveryCode: string): Promise<userTypeWithRecovery | null>
    generateTokenMeta( refreshTokenMeta: refreshTokenMeta): Promise<boolean>, 
    findUserMetaById(userId: ObjectId, deviceId: string): Promise<refreshTokenMeta | null>,
    updateTokenMetaDate(refreshTokenDate: number, userId: ObjectId, deviceId: string): Promise<boolean>
 }

export class userRepository implements userRepositoryInterface{
  async createUser(newUser: userType): Promise<ObjectId> {
    const dbUser = {...newUser , recoveryCode: {
      code: '',
      expiringDate: new Date(),
     used: false }} 
     await userModel.create(dbUser)
    return dbUser._id
  }
  async findUserById(id: ObjectId): Promise<userType | null> {
    return await userModel.findOne({_id: id})
  }
  async findUserByLoginOrEmail(login?: string, email?: string): Promise<userType | null> {
   
    if(login) {
      return await userModel.findOne({login: login})
    } else if(email) {
      return await userModel.findOne({email: email})
    } else {
      return null
    }
  }
  
  async findUserByAccountConfirmationCode(code: string):Promise<userDbType | null> {
    if(code) {
      return await userModel.findOne({'mailConfirmation.confirmationCode.code': code})
    } else {
      return null
    }
  }

  async confirmUser(user: userDbType): Promise<boolean> {
    const result = await userModel.updateOne({_id: user._id}, {$set: {"mailConfirmation.confirmed": true}})
    if(result.matchedCount === 1) {
      return true
    } else {
      return false
    }

  }
  async changePassword(new_password: string, id: ObjectId): Promise<boolean> {
    const result = await userModel.updateOne({_id: id}, {$set: {pasword: new_password, "recoveryCode.used": true}})
    return result.matchedCount === 1
  }

   async addCode(recoveryCode: recoveryCode, user: userType): Promise<boolean> {
    const result = await userModel.updateOne({_id: user._id}, {$set: {recoveryCode: recoveryCode}})
    if(result.matchedCount === 1) {
      return true
    } else {
      return false
    }

    
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<userTypeWithRecovery | null> {
    return await userModel.findOne({"recoveryCode.code": recoveryCode})
  }

  async generateTokenMeta(refreshTokenMeta:refreshTokenMeta):Promise<boolean> {
    const result =  await tokenModel.create(refreshTokenMeta)
    if(result) {
      return true
    } else {
      return false
    }
  }

  async findUserMetaById(userId: ObjectId, deviceId: string): Promise<refreshTokenMeta | null> {
    return await tokenModel.findOne({userId: userId, deviceId: deviceId })

  }

  async updateTokenMetaDate(refreshTokenDate: number, userId: ObjectId, deviceId: string): Promise<boolean> {
    return (await tokenModel.updateOne({userId: userId, deviceId: deviceId}, {$set: {createdData: refreshTokenDate}})).matchedCount === 1
  }
  
}


