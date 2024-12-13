import { bookModel } from "../db"
import { bookViewModel } from "../models/bookViewModel"
import { bookDb } from "../types/dbTypes"




 interface testRepositoryInterface {
    clearAll(): void
 }

 const getViewModel = (dbBook: bookDb):bookViewModel => {
    return {
      id: dbBook.id,
      title: dbBook.title
    }
}

export class testRepository implements testRepositoryInterface{
    async clearAll() {
      await bookModel.deleteMany({})
    } 

    async findInitial() {
      const result:bookViewModel[] = (await bookModel.find({}).lean()).map(getViewModel)
      return result
    } 



}