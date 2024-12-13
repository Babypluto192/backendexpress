import {db} from "../dbMemory"



 interface testRepositoryInterface {
    clearAll(): void
 }

export class testRepository implements testRepositoryInterface{
    async clearAll() {
      db.length = 0;
    } 


}