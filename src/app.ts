import express from "express"
import {  getBookRouter } from "./routes/bookRoutes"
import { getTestRouter } from "./routes/testRoutes"
import { db } from "./dbMemory"
import { getUserRouter } from "./routes/userRoutes"
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'

export const app = express()
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 1000,
  message: 'Too many request try after 10 minutes'
})

app.use(limiter)
const jsonBodyMidleweare = express.json()
app.use(cookieParser())
app.use(jsonBodyMidleweare)
app.use(("/book"),getBookRouter(db))
app.use(("/__test__"), getTestRouter(db))
app.use((''), getUserRouter())
