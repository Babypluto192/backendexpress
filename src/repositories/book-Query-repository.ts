import { bookModel } from "../db";
import { bookViewModel } from "../models/bookViewModel";
import { getBookModel } from "../models/getBookModel";
import { bookDb } from "../types/dbTypes";

export const getViewModel = (dbBook: bookDb):bookViewModel => {
    return {
      id: dbBook.id,
      title: dbBook.title
    }
}
interface bookQueryRepositoryInterface {
  findBooks({}: getBookModel): Promise<bookDb[]>,
  findBookById(id:number):Promise< bookDb | undefined>,
}


export class bookQueryRepository implements bookQueryRepositoryInterface {

  async findBooks({title, pageSize, pageNumber, sortField, sortOrder}: getBookModel): Promise<bookDb[]> {
     
     const filter: any = {}
     if(title) {
        filter.title = {$regex: title} 
     }
     let sortingParams:any  = {}
     if(sortField && sortOrder) {
          const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';
          sortingParams[sortField] = validSortOrder === 'asc' ? 1 : -1;
     }
     let requiredResponeCount: number = 0;
     if(pageSize && pageNumber) {
        requiredResponeCount = +pageSize * (+pageNumber - 1)
     } 
     const dbRequest = bookModel.find(filter).sort(sortingParams).skip(requiredResponeCount).limit(pageSize ? +pageSize : 0)
     
     return (await dbRequest.lean()).map(getViewModel)
     
  }

  async findBookById(id: number): Promise< bookDb  | undefined> {
    const data:bookDb | null = await bookModel.findOne({id: id})
    if(data) {
      return getViewModel(data)
    } { 
      return undefined
    }
  }


}