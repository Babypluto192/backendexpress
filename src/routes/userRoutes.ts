import { Router, type Request, type Response} from "express";
import { requestBody,  requestQuery, requestQueryAndBody } from "../types/requestTypes";
import { createUserModel } from "../models/createUserModel";
import { loginUserModel } from "../models/loginUserModel";
import { userService, userServiceInterface } from "../domain/user-service";
import { authValidationMiddleware, bodyValidationMiddleware, emailValidationMiddleware, loginValidationMiddleware, passwordValidationMiddleware, queryParamsValidationMiddlewareHandler, refreshTokenCookiesValdation, requiredEmailOrLoginValidationMiddleware } from "../middleware/validationsMiddleware";
import {  jwtService, jwtServiceInterface } from "../domain/jwt-service";
import { userType } from "../types/userType";
import { confirmUserModel } from "../models/confirmUserModel";
import { createRecoveryMailModel } from "../models/createRecoveryMailModel";
import { getRecoveryAcsessModel } from "../models/getRecoveryAcsessModel";
import { changePasswordModel } from "../models/changePasswordModel";




export const getUserRouter = () => {
const Service:userServiceInterface = new userService()
const tokenService:jwtServiceInterface = new jwtService()
const userRouter:Router = Router()
userRouter.post('/register/', 
  emailValidationMiddleware,
  loginValidationMiddleware,
  passwordValidationMiddleware,
  bodyValidationMiddleware,
  async (req:requestBody<createUserModel> , res:Response) => {
    const userEmailCheck = await Service.findUserByEmailOrLogin({email: req.body.email})
    const userLoginCheck = await Service.findUserByEmailOrLogin({login: req.body.login})
    if( userEmailCheck) {
      res.status(400).send({message: 'Email is already registred'})
      res.end()
      return;
    } else if(userLoginCheck) {
      res.status(400).send({message: 'Login is already taken'})
       res.end()
      return;
    }
    const result:boolean = await Service.registerUser({login: req.body.login, email: req.body.email, password: req.body.password})
    if(result) {
      res.sendStatus(201)
      res.end()
    } else {
      res.sendStatus(400)
      res.end()
    }
    
})
userRouter.post('/login/', 
  requiredEmailOrLoginValidationMiddleware,
  async (req: requestBody<loginUserModel>, res:Response) => {
  let result:boolean
  let user:userType | null
  if(req.body.email) {
    result = await Service.loginUser({email: req.body.email, password: req.body.password})
    user = await Service.findUserByEmailOrLogin({email: req.body.email})
  } else if(req.body.login) {
    result = await Service.loginUser({login: req.body.login, password: req.body.password})
    user = await Service.findUserByEmailOrLogin({login: req.body.login})
  } else {
    result = false
    user = null
  } 
  if(!user?.mailConfirmation.confirmed) {
    res.status(401).send("Confirm mail before login")
    res.end()
    return;
  }
  if(result && user) {
    
    const token = await tokenService.createJWT(user)
    const createDate = await tokenService.verifyRefreshToken(token.refreshToken)
    const deviceId = await Service.generateTokenMeta(user._id, req.header('x-forwarded-for') || req.socket.remoteAddress || '2', req.header('user-agent'), createDate?.iat! )
    
    if(token) {
      res.status(201).cookie('refreshToken', token.refreshToken, { httpOnly: true, sameSite: 'strict' }).cookie('deviceId', deviceId,{ httpOnly: true, sameSite: 'strict' } )
                   .header('Authorization', token.accessToken).send({message: "You succsefuly login"})
      res.end()
    } else {
      res.status(400)
      res.end()
    }
    
    
  } else {
    res.status(400)
    res.end()
  }
}
)

userRouter.get('/specialloggeddata', authValidationMiddleware, async (req: Request, res:Response) => {
  res.status(200).send({message: "Yusuf krutoi", user: req.user?.login})
  res.end()
  return;
})

userRouter.get('/refresh',
  refreshTokenCookiesValdation,
  queryParamsValidationMiddlewareHandler
  , async (req: Request, res:Response) => {
  const refreshToken = req.cookies.refreshToken
  const deviceId  = req.cookies.deviceId

   if (!refreshToken && !deviceId) {
    res.status(401).send('Access Denied. No refresh token or Device id provided.');
    res.end()
  } else {
    const decoded = await tokenService.verifyRefreshToken(refreshToken)
    if(decoded) {
      const verifyRefreshToken = await Service.verifyTokenMeta( decoded._id, decoded.iat!, deviceId)
      if(!verifyRefreshToken) {
        res.status(400).send('Refresh token is not valid.');
        res.end()
      }
      const userId = Service.getUserId(decoded._id)
      if(userId) {
        const user = await Service.findUserById(userId)
        if(user) {
          const token = await tokenService.createJWT(user)
          const createDate = await tokenService.verifyRefreshToken(token.refreshToken)
          
          const updateTokenMeta = await Service.updateRefreshTokenDate(createDate?.iat!,userId,deviceId  )
          if(!updateTokenMeta) {
            res.status(500).send({message: 'server error'})
          }
          res.status(201).cookie('refreshToken', token.refreshToken, { httpOnly: true }).header('Authorization', token.accessToken).send({message: "You succsefuly updated token"})
           res.end()
        } else {
          res.status(404).send('User not found.');
          res.end()
        }
        
      } else {
        res.status(404).send('User not found.');
        res.end()
      }
    } else {
      res.status(400).send('Invalid refresh token.');
      res.end()
    }

  }
    
      
 
  
})


userRouter.get('/confirmation', async (req:requestQuery<confirmUserModel>,res:Response) => {
  if(req.query.code) {
    const result = await Service.confirmUser(req.query.code)
    if(result) {
      res.status(200).send({message: "You confirmed your mail"})
      res.end()
    } else {
      res.status(400).send({message: "Code expire or is not right"})
      res.end();
    }
  } else {
    res.status(400)
    res.end()
  }
  

})

userRouter.get('/recoveryaccess', async (req:requestQuery<getRecoveryAcsessModel>,res:Response) => {
  
  const user = await Service.findUserByRecoveryCode(req.query.recoveryCode)
  if(!user) {
    res.status(404).send("User or email not existing")
    res.end()
    return;
  }
  if(!user?.mailConfirmation.confirmed) {
    res.status(401).send("Confirm mail before")
    res.end()
    return;
  } 
  if(user.recoveryCode.used) {
    res.status(400).send({message: "You already changed password"})
    res.end()
    return;
  }

   if(user.recoveryCode.expiringDate < new Date()) {
    res.status(400).send({message: "Your code expired"})
    res.end()
    return;
  }
  


  res.status(200).send("Send new password to change it")
  res.end()
 
  

})

userRouter.post('/recoveryaccess', async (req:requestQueryAndBody<getRecoveryAcsessModel, changePasswordModel>,res:Response) => {
  
  const user = await Service.findUserByRecoveryCode(req.query.recoveryCode)
  if(!user) {
    res.status(404).send("User or email not existing")
    res.end()
    return;
  }
  if(!user?.mailConfirmation.confirmed) {
    res.status(401).send("Confirm mail before")
    res.end()
    return;
  } 

  if(user.recoveryCode.used) {
    res.status(400).send({message: "You already changed password"})
    res.end()
    return;
  }

   if(user.recoveryCode.expiringDate < new Date()) {
    res.status(400).send({message: "Your code expired"})
    res.end()
    return;
  }
  
  const result = await Service.changePassword(req.body.new_password, user._id)
    
  if(result) {
    res.status(200).send("Password changed")
    res.end()
  } else {
    res.status(401).send("Password coudn't change")
    res.end()
    return;
  }
  

  

})


userRouter.post('/recovery',
   emailValidationMiddleware,
    bodyValidationMiddleware,
   async (req:requestBody<createRecoveryMailModel>,res:Response) => {
  const user = await Service.findUserByEmailOrLogin({email: req.body.email})
  if(!user) {
    res.status(404).send("User or email not existing")
    res.end()
    return;
  }
  
  if(!user!.mailConfirmation.confirmed) {
    res.status(401).send("Confirm mail before recover password")
    res.end()
    return;
  }
  const result = await Service.getRecoveryMail(req.body.email, user)

  if(result) {
    res.status(200).send({message: "Recovery link sent to your mail"})
    res.end()
    return;
  } else {
    res.status(400)
    res.end()
    return;
  }

  
  
  
  

})

return userRouter
}
