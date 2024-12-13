import { bookModel } from "../db"
import { bookDb } from "../types/dbTypes"
import { getViewModel } from "./book-Query-repository"


  export interface bookRepositoryInterface {
    createBook(newBook:bookDb): Promise<bookDb | undefined>,
    deleteBook(id:number): Promise<boolean>,
    updateBook(id: number, title: string): Promise<undefined | boolean> 
 }

export class bookRepository implements bookRepositoryInterface{
  
 
  async createBook(newBook:bookDb): Promise<bookDb | undefined> {
    const result = await bookModel.create(newBook)
    return getViewModel(newBook)
  }
  

  async deleteBook(id: number): Promise<boolean> {
    const res = await bookModel.deleteOne({id: id})
    return res.deletedCount === 1
  }
  
  async updateBook(id: number, title: string): Promise<undefined | boolean> {
    if(!await bookModel.findOne({id: id})) {
      return undefined
    }
   const res = await bookModel.updateOne({id: id}, {$set: {title: title}})
  if(res.matchedCount === 1) {
    return true
  } else {
    return false
  }
}


}