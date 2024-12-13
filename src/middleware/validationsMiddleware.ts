import { NextFunction, Request, Response } from "express";
import { body, param, validationResult, query, cookie, header } from "express-validator";
import { jwtService } from "../domain/jwt-service";
import { userService } from "../domain/user-service";

const tokenService = new jwtService()
const UserService = new userService()
const allowedFields:string[] = ['title', 'id']

export const titleValidationMiddleware = body('title').trim().notEmpty().isString().isLength({min: 3, max:50}).withMessage("Body of request should be string and from 3 to 50 symbols also shoudn't empty")
export const refreshTokenCookiesValdation = cookie('refreshToken')
export const idValidationMiddleware = param('id').isInt().withMessage("id should be number")
export const paginationValidationMiddleware = [
  query("pageSize").optional().isInt({min: 1}).withMessage("page size must be a number and be greater than 0"), 
  query("pageNumber").optional().isInt({min: 1}).withMessage("page number must be a number and be greater than 0")
]
export const sortingValidationMiddleware = [
  query("sortField").optional().custom((value) => {
    if(allowedFields.includes(value)) {
      return true
    } else {
      throw new Error(`sort Field must be real field like ${allowedFields}`)
    }
  }),
  query("sortOrder").optional().custom((value) => {
    if(value === 'asc' || value === 'desc') {
      return true
    } else {
      throw new Error("sort Order must be asc or desc")
    }
  }
)
]
export const authValidationMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
  header('authorization')
  const erorrs = validationResult(req);
  if (!erorrs.isEmpty()) {
      res.status(401).send({ errors: erorrs.array() });
  } 
  if(!req.headers.authorization){
    res.status(401).send({ errors: erorrs.array() });
    return;
  }
 
  const token = req.headers.authorization.split(' ')[1]
  const userId = await tokenService.getUserIdByAccessToken(token) 
  if(userId) {
    req.user = await UserService.findUserById(userId) 
    next()
  } else {
    res.status(401).send({ errors: erorrs.array() });
    res.end()
  }
}
export const loginValidationMiddleware = body('login').trim().notEmpty().isString().isLength({min: 3}).withMessage("Login must be string and more then 3 symbols")
export const emailValidationMiddleware = body('email').trim().notEmpty().isEmail().withMessage("email must be right format")
export const passwordValidationMiddleware = body('password').trim().notEmpty().withMessage("Password should be strong")
export const filterValidationMiddleware = query("title").optional().isString().trim().notEmpty().isLength({min: 1, max:50}).withMessage("filter should be string and not empty and from 1 to 50 symbols")
export const requiredEmailOrLoginValidationMiddleware = [
  emailValidationMiddleware.optional(),
  loginValidationMiddleware.optional(),
  (req:Request, res:Response, next:NextFunction) => {
    const { email, login } = req.body;
    const erorrs = validationResult(req)
     if (erorrs.isEmpty() && (!email || !login) ) {
      next()
    } else {
      res.status(400).send({ errors: erorrs.array() });
    }
    
  }
]
export const bodyValidationMiddleware =  (req: Request, res:Response, next: NextFunction):void => {
  const erorrs = validationResult(req);
  if (erorrs.isEmpty()) {
      next()
  } else {
    res.status(400).send({ errors: erorrs.array() });
  }
  
}

export const queryParamsValidationMiddlewareHandler =  (req: Request, res:Response, next: NextFunction):void => {
  const erorrs = validationResult(req);
  if (erorrs.isEmpty()) {
      next()
  } else {
    res.status(400).send({ errors: erorrs.array() });
  }
  
}


export const paramValidationMiddleware =  (req: Request, res:Response, next: NextFunction):void => {
  const erorrs = validationResult(req);
  if (erorrs.isEmpty()) {
      next()
  } else {
      res.status(404).send({ errors: erorrs.array() });
  }
  
}
