import { Request } from "express";
import { ObjectId } from "mongodb"; 
import { userType } from "./userType";

declare module "express" {
  interface Request {
    user?: userType | null,
  
  }
}