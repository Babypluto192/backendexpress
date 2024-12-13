import { ObjectId } from "mongodb";
import { Settings } from "../settings";
import { userType } from "../types/userType";
import jwt, { JwtPayload } from "jsonwebtoken"

export interface jwtServiceInterface {
  createJWT(user:userType): Promise<{accessToken: string,refreshToken:string }>
  getUserIdByAccessToken(token: string): Promise<ObjectId | null>,
  getUserIdByRefreshToken(token: string): Promise<ObjectId | null>,
  verifyRefreshToken(refreshToken: string): Promise<JwtPayload | null>
}

type TokenPayload =  {
    _id: string; 
}






export class jwtService implements jwtServiceInterface {
  async createJWT(user: userType): Promise<{accessToken: string,refreshToken:string }> {
    const accessToken = jwt.sign({_id: user._id}, Settings.JWT_SECRET_ACCESS, {expiresIn: '1m'})
    const refreshToken = jwt.sign({_id: user._id}, Settings.JWT_SECRET_REFRESH, {expiresIn: '10d'})
  
    return {accessToken: accessToken, refreshToken: refreshToken }
  }
  async getUserIdByAccessToken(token: string): Promise<ObjectId | null> {
      try {
          const result= jwt.verify(token, Settings.JWT_SECRET_ACCESS) 
          
          if (typeof result !== 'object' || result === null || !('_id' in result)) {
            throw new Error("Invalid token payload.");
        }
          const { _id } = result as TokenPayload
          if (!ObjectId.isValid(_id)) {
              throw new Error("Invalid ObjectId format.");
          }
          
          
          return new ObjectId(_id)
      } catch(error) {
        return null
      }
  
  }


  async getUserIdByRefreshToken(token: string): Promise<ObjectId | null> {
      try {
          const result= jwt.verify(token, Settings.JWT_SECRET_REFRESH) 
          if (typeof result !== 'object' || result === null || !('_id' in result)) {
            throw new Error("Invalid token payload.");
        }
          const { _id } = result as TokenPayload
          if (!ObjectId.isValid(_id)) {
              throw new Error("Invalid ObjectId format.");
          }
                
          return new ObjectId(_id)
      } catch(error) {
        return null
      }
  
  }
  

  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload | null> {
    const result = await jwt.verify(refreshToken, Settings.JWT_SECRET_REFRESH)
    try {
      if (typeof result !== 'object' || result === null) {
            throw new Error("Invalid token payload.");
        }
        return result 
    } catch(error) {
      return null
    }
    
  }

  

}