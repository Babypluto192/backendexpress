import {db} from "../dbMemory"
import { bookViewModel } from "../models/bookViewModel"
import { bookDb } from "../types/dbTypes"

const getViewModel = (dbBook: bookDb):bookViewModel => {
    return {
      id: dbBook.id,
      title: dbBook.title
    }
}

  interface bookRepositoryInterface {
    findBooks(title:string): Promise<bookViewModel[] | bookDb>,
    findBookById(id:number):Promise< bookViewModel | undefined>,
    createBook(title: string): Promise<bookViewModel | undefined>,
    deleteBook(id:number): Promise<boolean>,
    updateBook(id: number, title: string): Promise<undefined | boolean> 
 }

export class bookRepository implements bookRepositoryInterface{
  
  
  async findBooks(title: string): Promise<bookDb | bookViewModel[]> {
    let data = db
    if(title) {
      data = db.filter(el => el.title.indexOf(title) > -1)
      return data.map(getViewModel)
  } else {
    return data
  }
  }

  async findBookById(id: number): Promise< bookViewModel | undefined> {
    const index = db.findIndex(el => el.id === id);
    if(index > -1) {
        const foundBook = db.find(el => el.id === id)
        if(foundBook) {
          return getViewModel(foundBook)
        } else {
          return undefined;
        } 
  } else {
      return undefined;
  }
  }

  async createBook(title: string): Promise<bookViewModel | undefined> {
    const newBook:bookDb = { 
      id: +(new Date),
      title: title,
    }
    db.push(newBook);
    return getViewModel(newBook)
  }
  

  async deleteBook(id: number): Promise<boolean> {
    const index = db.findIndex(el => el.id === id);
    if(index > -1) {
      db.splice(index ,1)
      return true
  } else {
      return false;
  }
  }
  
  async updateBook(id: number, title: string): Promise<undefined | boolean> {
  const index = db.findIndex(el => el.id === id);
  if(index > -1) {
    const data = db.find(el => el.id === id)
    if(data) {
      data.title = title 
      return true
    } else {
      return undefined
    }
  
  } else {
    return undefined
  }
  }


}