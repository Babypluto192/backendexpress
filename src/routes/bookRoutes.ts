import { Router, type Response } from "express";
import { bookViewModel } from "../models/bookViewModel";
import { requestBody, requestParams, requestParamsAndBody, requestQuery } from "../types/requestTypes";
import { getBookModel } from "../models/getBookModel";
import { uriParamsModel } from "../models/uriParamsBookModel";
import { createBookModel } from "../models/createBookModel";
import { updateBookModel } from "../models/updateBookModel";
import {bookServiceInterface, bookService } from "../domain/book-service";
import { idValidationMiddleware, bodyValidationMiddleware, titleValidationMiddleware, paramValidationMiddleware, paginationValidationMiddleware, filterValidationMiddleware, sortingValidationMiddleware, queryParamsValidationMiddlewareHandler } from "../middleware/validationsMiddleware";
import { bookDb } from "../types/dbTypes";
import { bookQueryRepository } from "../repositories/book-Query-repository";




 const Repository: bookServiceInterface = new bookService()
 const QueryRepository = new bookQueryRepository()


export const getBookRouter = (db:Array<bookDb>) => {

const bookRouter:Router = Router() 

bookRouter.get('/',
  filterValidationMiddleware,
  paginationValidationMiddleware,
  sortingValidationMiddleware,
  queryParamsValidationMiddlewareHandler,
   async (req:requestQuery<getBookModel>,res:Response<bookViewModel[] | bookDb>) => {
  const respond = await QueryRepository.findBooks({title: req.query.title, pageSize: req.query.pageSize, pageNumber: req.query.pageNumber,sortField: req.query.sortField, sortOrder: req.query.sortOrder})
  res.status(200).send(respond)
})

bookRouter.get('/:id',
   idValidationMiddleware,
   paramValidationMiddleware,
   async (req:requestParams<uriParamsModel>,res:Response<bookViewModel>) => {
    const response =await QueryRepository.findBookById(+req.params.id)
    if(response) {
      res.status(200).json(response)
      res.end()
    } else {
      res.sendStatus(404)
      res.end()
    }
  
 
   
})


bookRouter.post('/', 
  titleValidationMiddleware, 
  bodyValidationMiddleware,
  async (req:requestBody<createBookModel>,res:Response<bookViewModel>) => {
  const response = await Repository.createBook(req.body.title)
  if(response) {
    res.status(201).json(response)
    res.end()
  } else {
    res.sendStatus(400) 
    res.end()
  }
})

bookRouter.delete('/:id', 
  idValidationMiddleware,
  paramValidationMiddleware,
  async (req:requestParams<uriParamsModel>,res:Response) => {
  const response = await Repository.deleteBook(+req.params.id);
  if(response) {    
      res.status(204)
      res.end()
  } else {
    res.sendStatus(404)
    res.end()
  }
})


bookRouter.put('/:id', 
  idValidationMiddleware,
  paramValidationMiddleware,
  titleValidationMiddleware, 
  bodyValidationMiddleware,
  async (req:requestParamsAndBody<uriParamsModel, updateBookModel>,res:Response<bookViewModel>) => {
  const response = await Repository.updateBook(+req.params.id, req.body.title)
  if(response === undefined) {
    res.sendStatus(404)
    res.end()
    return;
  } else if(response === true) {
    const respond = await QueryRepository.findBookById(+req.params.id)
    res.status(201).json(respond ? respond : {id: 1, title: "Ошибка при поиске"})
    return;
  }  else {
    res.status(400)
    res.end()
    return;
  }
})

return bookRouter;
}

