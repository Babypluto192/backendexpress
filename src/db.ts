
import { bookDb, refreshTokenMeta, userDbType } from "./types/dbTypes"
import { Settings } from "./settings"
import mongoose from 'mongoose';


const mongoURI = Settings.MONGO_URI
const dbName = 'shop'

const { Schema } = mongoose;
const bookSchema = new Schema<bookDb>({
  id: {type: Number, required: true},
  title: {type: String, required: true}
})
const usersSchema = new Schema<userDbType>({
    _id: mongoose.mongo.BSON.ObjectId,
    login: {type: String, required: true},
    email: {type: String, required: true},
    pasword: {type: String, required: true},
    createdDate: Date,
    mailConfirmation: {confirmationCode: {
    code: String,
    expiringDate: Date
    },
    confirmed: Boolean,
    },
    recoveryCode: {
      code: String,
      expiringDate: Date,
      used: Boolean
    },
})
const refreshTokenMetaSchema = new Schema<refreshTokenMeta>({
  userId: mongoose.mongo.BSON.ObjectId,
  createdData: Number,
  deviceId: String,
  ipAdress: String,
  deviceName: String || undefined
}
)

export const bookModel = mongoose.model('books', bookSchema)
export const userModel = mongoose.model('users', usersSchema)
export const tokenModel = mongoose.model('tokenMeta', refreshTokenMetaSchema)
export async function runDb() {
  try {
  await mongoose.connect(mongoURI + '/' + dbName);
    console.log("Succesufully connected")
  } catch {
    console.log("Error")
    await mongoose.disconnect()
  }
}

export async function closeDbConnection() {
  await mongoose.disconnect()
}