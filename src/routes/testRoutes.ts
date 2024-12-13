import { Router, type Request, type Response} from "express";
import { testRepository } from "../repositories/test-repository-db";
import { bookDb } from "../types/dbTypes";



export const getTestRouter = (db:Array<bookDb>) => {

const Repository = new testRepository()
const testRouter:Router = Router()
testRouter.delete('/delete',
   async (req:Request,res:Response) => {
  await Repository.clearAll();
  res.status(204);
  res.end();
})


testRouter.get('/bookInitial',async (req:Request,res:Response) => {
  const result = await Repository.findInitial()
  res.status(200).send(result)
  res.end();
}) 

return testRouter
}
