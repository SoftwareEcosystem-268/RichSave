import { Db, ObjectId } from 'mongodb'

export interface User {
  _id?: string
  name: string
  email: string
  password: string
  phone?: string
  location?: string
  favorites: string[]
  createdAt: Date
  updatedAt: Date
}

export class UserModel {
  private collectionName = 'users'

  async create(db: Db, userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await db.collection(this.collectionName).insertOne(user as any)
    return { ...user, _id: result.insertedId.toString() }
  }

  async findByEmail(db: Db, email: string): Promise<User | null> {
    return await db.collection(this.collectionName).findOne({ email }) as unknown as User | null
  }

  async findById(db: Db, id: string): Promise<User | null> {
    return await db.collection(this.collectionName).findOne({ _id: new ObjectId(id) }) as unknown as User | null
  }

  async update(db: Db, id: string, updates: Partial<User>): Promise<User | null> {
    await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return await this.findById(db, id)
  }

  async addFavorite(db: Db, userId: string, dealId: string): Promise<void> {
    await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favorites: dealId }, $set: { updatedAt: new Date() } }
    )
  }

  async removeFavorite(db: Db, userId: string, dealId: string): Promise<void> {
    await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: dealId } as any, $set: { updatedAt: new Date() } }
    )
  }

  async getFavorites(db: Db, userId: string): Promise<string[]> {
    const user = await this.findById(db, userId)
    return user?.favorites || []
  }
}

export const userModel = new UserModel()
