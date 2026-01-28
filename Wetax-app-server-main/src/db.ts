// import type { ObjectId, WithId } from 'mongodb'
import 'dotenv/config'
import { Collection, MongoClient } from 'mongodb'
import { TaxReturn, User, AdminActivity, ChatConversation, ChatTokenUsage } from './types'

const MONGO_URI = process.env.MONGO_URI
const DB_NAME = process.env.DB_NAME

let dbClient: MongoClient | undefined = undefined

export enum CollectionEnum {
  'Users' = 'users',
  'TaxReturns' = 'taxReturns',
  'AdminActivities' = 'adminActivities',
  'ChatConversations' = 'chatConversations',
  'ChatTokenUsage' = 'chatTokenUsage',
}

type DbT = {
  [CollectionEnum.Users]: Collection<User>
  [CollectionEnum.TaxReturns]: Collection<TaxReturn>
  [CollectionEnum.AdminActivities]: Collection<AdminActivity>
  [CollectionEnum.ChatConversations]: Collection<ChatConversation>
  [CollectionEnum.ChatTokenUsage]: Collection<ChatTokenUsage>
}

let _db: DbT | undefined = undefined

export const connectDb = async () => {
  console.log('Connecting to: ', MONGO_URI)

  if (!MONGO_URI) {
    throw new Error('MONGO_URI not defined')
  }

  if (!DB_NAME) {
    throw new Error('DB_NAME not defined')
  }

  dbClient = await new MongoClient(MONGO_URI).connect().catch((e) => {
    throw new Error(`Failed to connect to database: ${String(e)}`)
  })

  console.log('Database connected to: ', DB_NAME)

  const db = dbClient!.db(DB_NAME)

  _db = {
    [CollectionEnum.Users]: db.collection<User>(CollectionEnum.Users),
    [CollectionEnum.TaxReturns]: db.collection<TaxReturn>(CollectionEnum.TaxReturns),
    [CollectionEnum.AdminActivities]: db.collection<AdminActivity>(CollectionEnum.AdminActivities),
    [CollectionEnum.ChatConversations]: db.collection<ChatConversation>(CollectionEnum.ChatConversations),
    [CollectionEnum.ChatTokenUsage]: db.collection<ChatTokenUsage>(CollectionEnum.ChatTokenUsage),
  }
}

export const db = () => {
  if (!_db) {
    throw new Error('_db not defined')
  }

  return _db
}
