import { createUserModel } from "../models/createUserModel";
import bcrypt from "bcrypt"
import { refreshTokenMetaService, userType, userTypeWithRecovery } from "../types/userType";
import { ObjectId } from "mongodb";
import { userRepository } from "../repositories/user-repository-db";
import { loginUserModel } from "../models/loginUserModel";
import { mailManager } from "../managers/email-manager";
import {v4 as uuidv4, v4} from "uuid"
import {add} from "date-fns/add"
import { recoveryCode } from "../types/dbTypes";
type findUserByEmailOrLoginType =
  | {email: string , login?: string}
  | {login: string, email?: string }

export interface userServiceInterface {
  registerUser({}: createUserModel): Promise<boolean>,
  loginUser(data:loginUserModel): Promise<boolean>,
  findUserById(id: ObjectId):Promise<userType | null>
  findUserByEmailOrLogin(data:findUserByEmailOrLoginType ):Promise<userType | null>,
  confirmUser(code: string): Promise<boolean>,
  getRecoveryMail(email: string, user:userType): Promise<boolean>,
  changePassword(new_password: string,id:ObjectId): Promise<boolean>,
  findUserByRecoveryCode(recoveryCode: string): Promise<userTypeWithRecovery | null> ,
  generateTokenMeta(userId:ObjectId,ipAdress:string, deviceName:string | undefined, createDate: number): Promise<string>,
  verifyTokenMeta(userId:string, createDate: number, deviceId: string): Promise<boolean>,
  getUserId(userId:string): ObjectId,
  updateRefreshTokenDate(refreshTokenDate: number, userId: ObjectId, deviceId: string): Promise<boolean>
}

const  mailSender = new mailManager()

const Repository = new userRepository()
export class userService implements userServiceInterface {
  async registerUser({login,email, password  }: createUserModel): Promise<boolean> {
    const hashPassword = await this._passwordHashing(password)

    const newUser:userType = {
      _id: new ObjectId(),
      login: login,
      email: email,
      pasword: hashPassword,
      createdDate: new Date(),
      mailConfirmation: {
        confirmationCode: {
          code: uuidv4(),
          expiringDate: add(new Date(), {
            hours: 1
          }),
      },
      confirmed: false
      }
    }
    const result = await Repository.createUser(newUser)
    if(result){
      mailSender.sendRegistrationMail(newUser)
      return true
    } else {
      return false
    }

  }
  async findUserById(id: ObjectId): Promise<userType | null> {
    return await Repository.findUserById(id)
  }
  async findUserByEmailOrLogin(data:findUserByEmailOrLoginType): Promise<userType | null> {
 
    if(data.email) {
      return await Repository.findUserByLoginOrEmail(data.login, data.email)
    } else if(data.login) {
      return await Repository.findUserByLoginOrEmail(data.login, data.email)
    } else {
      return null
    }
  } 

  private async _passwordHashing(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  } 


  async loginUser(data:loginUserModel): Promise<boolean> {
     const loginOrEmail = 'login' in data ? data.login : data.email;
     if (!loginOrEmail) {
        return false
      } 
      const user = await Repository.findUserByLoginOrEmail(data.login, data.email)
      if(!user){
        return false
      } 
      
      const checkedPassword = await bcrypt.compare(data.password, user.pasword ) 

      if(checkedPassword) {
        
        return true
      } else {
        return false
      }

  }


  async confirmUser(code: string): Promise<boolean> {
    const result = await Repository.findUserByAccountConfirmationCode(code)

    if(result && result.mailConfirmation.confirmationCode.expiringDate < new Date()) {
      return false
    }
    if(result) {
      const isConfrimed = await Repository.confirmUser(result)
      if(isConfrimed) {
        return true
      } else {
        return false
      }
      
    } else {
      return false
    }
  }

  async getRecoveryMail(email: string, user:userType): Promise<boolean> {
    const recoveryCode = uuidv4()
    const dbRecoveryCode:recoveryCode = {
      code: recoveryCode,
      expiringDate: add(new Date(), {
        hours: 1
      }),
      used: false
    }
    const result = await Repository.addCode(dbRecoveryCode, user)
    await mailSender.sendRecoveryMail(email, user, recoveryCode)
    return result
  }

  async changePassword(new_password: string, id:ObjectId): Promise<boolean> {
    const hashedNewPasword = await this._passwordHashing(new_password)
    const result:boolean = await Repository.changePassword(hashedNewPasword, id)

    return result
  }
  
  async findUserByRecoveryCode(recoveryCode: string): Promise<userTypeWithRecovery | null> {
    return await Repository.findUserByRecoveryCode(recoveryCode)
  }
 

  async generateTokenMeta(userId:ObjectId,ipAdress:string, deviceName:string | undefined, createDate:number ): Promise<string> {
    const deviceId =  uuidv4() 
    const refreshTokenMeta: refreshTokenMetaService = {
      userId: userId,
      createdData: createDate,
      deviceId: deviceId,
      ipAdress: ipAdress,
      deviceName: deviceName
  } 
    await Repository.generateTokenMeta(refreshTokenMeta)
    return deviceId
  }


  async verifyTokenMeta(userId:string, createDate: number, deviceId: string): Promise<boolean> {
    const refreshTokenMeta = await Repository.findUserMetaById(new ObjectId(userId), deviceId )
    
    if(refreshTokenMeta) {
    if(refreshTokenMeta.createdData === createDate) {
      return true
    } else {
      return false
    } 
  } else {
      return false
    }
  }

  getUserId(userId: string): ObjectId {
    return new ObjectId(userId)
  }

  async updateRefreshTokenDate(refreshTokenDate: number, userId: ObjectId, deviceId: string): Promise<boolean> {
    return await Repository.updateTokenMetaDate(refreshTokenDate, userId, deviceId)
  }


}