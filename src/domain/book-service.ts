import { bookViewModel } from "../models/bookViewModel"
import { bookQueryRepository } from "../repositories/book-Query-repository"
import { bookRepository } from "../repositories/book-repository-db"
import { bookRepositoryInterface } from "../repositories/book-repository-db"
import { bookDb } from "../types/dbTypes"


const Repository: bookRepositoryInterface = new bookRepository()
const QueryRepository = new bookQueryRepository();
 export interface bookServiceInterface {
    createBook(title: string): Promise<bookViewModel | undefined>,
    deleteBook(id:number): Promise<boolean>,
    updateBook(id: number, title: string): Promise<undefined | boolean> 
 }

export class bookService implements bookServiceInterface{
  
  
  

  async createBook(title: string): Promise<bookViewModel | undefined> {
    const newBook:bookDb = { 
      id: +(new Date),
      title: title,
    }
    const result = await Repository.createBook(newBook)
    if(result) {
      return result
    } else {
      return undefined
    }
    
  }
  
  async deleteBook(id: number): Promise<boolean> {
    return await Repository.deleteBook(id)
  }
  
  async updateBook(id: number, title: string): Promise<undefined | boolean> {
    if(!await QueryRepository.findBookById(id)) {
      return undefined
    }
   return await Repository.updateBook(id, title)
 
}


}