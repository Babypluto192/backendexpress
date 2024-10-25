import express, {type Request, type Response} from "express"
import type { DbInterface } from "./DbInterface"

const app = express()
const jsonBodyMidleweare = express.json()
app.use(jsonBodyMidleweare)
const port:number = 3000

  const db:Array<DbInterface> = [
      {id: 1,title: "sometihng"}, {id: 2,title: "sometihng1"}, {id: 3,title: "sometihng2"}, {id: 4,title: "sometihng3"}
  ]

app.get('/', (req:Request,res:Response) => {
  let data = db
  if(req.query.title) {
    data = db.filter(el => el.title.indexOf(req.query.title as string) > -1)
    res.status(200).json(data)
    res.end()
  } else {
    res.status(200).json(data)
    res.end()
  }
  

})

app.get('/:id', (req:Request,res:Response) => {
  const index = db.findIndex(el => el.id === +req.params.id);
  if(index > -1) {
      res.status(200).json(db.find(el => el.id === +req.params.id))
      res.end()
  } else {
    res.sendStatus(404)
    res.end()
    return;
  }
  
 
  
  
})


app.post('/', (req:Request,res:Response) => {
  if(!req.body.title){
    res.sendStatus(400)
    return;
  } else if(!req.body.title.replace(/\s/g, '').length) {
    res.sendStatus(400)
    return;
  }
  const newObject:DbInterface = { 
      id: +(new Date),
      title: req.body.title,
    }
  db.push(newObject)

  res.status(201).json(newObject)

})

app.delete('/:id', (req:Request,res:Response) => {
  const index = db.findIndex(el => el.id === +req.params.id);
  if(index > -1) {
      db.splice(+req.params.id -1 ,1)
      res.status(204)
      res.end()
  } else {
    res.sendStatus(404)
    res.end()
    return;
  }
})


app.put('/:id', (req:Request,res:Response) => {
  const index = db.findIndex(el => el.id === +req.params.id);
  if(index > -1 && req.body.title && req.body.title.replace(/\s/g, '').length) {
      const data = db.find(el => el.id === +req.params.id)
      if(data) {
        data.title = req.body.title
      } else {
        res.sendStatus(500)
        res.end()
        return;
      }
      res.status(204)
      res.end()
  } else {
    res.sendStatus(404)
    res.end()
    return;
  }
})


app.listen(port, () => {})
console.log("Сервер работает на порте 3000")