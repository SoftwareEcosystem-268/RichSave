import { ObjectId, Db } from 'mongodb'
import { getDb } from './db'
import bcrypt from 'bcryptjs'

// User Model
export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  phone?: string
  location?: string
  favorites: string[]
  createdAt: Date
  updatedAt: Date
  preferences: {
    pushNotifications: boolean
    locationServices: boolean
    darkMode: boolean
  }
}

export const UserCollection = 'users'

export class UserModel {
  static async create(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDb()
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const result = await db.collection(UserCollection).insertOne({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return result
  }

  static async findByEmail(email: string) {
    const db = await getDb()
    return await db.collection(UserCollection).findOne({ email })
  }

  static async findById(id: string) {
    const db = await getDb()
    return await db.collection(UserCollection).findOne({ _id: new ObjectId(id) })
  }

  static async update(id: string, updates: Partial<User>) {
    const db = await getDb()
    const result = await db.collection(UserCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return result
  }

  static async updatePassword(id: string, newPassword: string) {
    const db = await getDb()
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await db.collection(UserCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    )
    return result
  }

  static async addFavorite(userId: string, dealId: string) {
    const db = await getDb()
    const result = await db.collection(UserCollection).updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { favorites: dealId }, $set: { updatedAt: new Date() } }
    )
    return result
  }

  static async removeFavorite(userId: string, dealId: string) {
    const db = await getDb()
    const result = await db.collection(UserCollection).updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { favorites: dealId } as any, $set: { updatedAt: new Date() } }
    )
    return result
  }
}

// Deal Model
export interface Deal {
  _id?: ObjectId
  title: string
  description: string
  discount: string
  originalPrice: number
  discountedPrice: number
  storeName: string
  storeLogo?: string
  image: string
  category: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  expiresAt: Date
  terms?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const DealCollection = 'deals'

export class DealModel {
  static async create(dealData: Omit<Deal, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDb()
    const result = await db.collection(DealCollection).insertOne({
      ...dealData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return result
  }

  static async findAll(filter: any = {}) {
    const db = await getDb()
    return await db.collection(DealCollection).find({ isActive: true, ...filter }).toArray()
  }

  static async findById(id: string) {
    const db = await getDb()
    return await db.collection(DealCollection).findOne({ _id: new ObjectId(id) })
  }

  static async findByCategory(category: string) {
    const db = await getDb()
    return await db.collection(DealCollection).find({ category, isActive: true }).toArray()
  }

  static async search(query: string) {
    const db = await getDb()
    return await db.collection(DealCollection).find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { storeName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    }).toArray()
  }

  static async findNearby(lat: number, lng: number, maxDistance = 10000) {
    const db = await getDb()
    return await db.collection(DealCollection).find({
      isActive: true,
      'location.lat': { $gte: lat - 0.1, $lte: lat + 0.1 },
      'location.lng': { $gte: lng - 0.1, $lte: lng + 0.1 },
    }).toArray()
  }

  static async update(id: string, updates: Partial<Deal>) {
    const db = await getDb()
    const result = await db.collection(DealCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return result
  }

  static async delete(id: string) {
    const db = await getDb()
    const result = await db.collection(DealCollection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    )
    return result
  }
}

// Savings/Redemption Model
export interface Redemption {
  _id?: ObjectId
  userId: ObjectId
  dealId: string
  dealTitle: string
  storeName: string
  savings: number
  redeemedAt: Date
}

export const RedemptionCollection = 'redemptions'

export class RedemptionModel {
  static async create(redemptionData: Omit<Redemption, '_id'>) {
    const db = await getDb()
    const result = await db.collection(RedemptionCollection).insertOne(redemptionData)
    return result
  }

  static async findByUserId(userId: string) {
    const db = await getDb()
    return await db.collection(RedemptionCollection)
      .find({ userId: new ObjectId(userId) })
      .sort({ redeemedAt: -1 })
      .toArray()
  }

  static async getTotalSavings(userId: string) {
    const db = await getDb()
    const result = await db.collection(RedemptionCollection).aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$savings' } } },
    ]).toArray()
    return result[0]?.total || 0
  }

  static async getTodaySavings(userId: string) {
    const db = await getDb()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const result = await db.collection(RedemptionCollection).aggregate([
      { $match: { userId: new ObjectId(userId), redeemedAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$savings' } } },
    ]).toArray()
    return result[0]?.total || 0
  }

  static async getMonthlySavings(userId: string, months = 6) {
    const db = await getDb()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    return await db.collection(RedemptionCollection).aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          redeemedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$redeemedAt' },
            month: { $month: '$redeemedAt' },
          },
          savings: { $sum: '$savings' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]).toArray()
  }
}

// OTP Model for password reset
export interface OTP {
  _id?: ObjectId
  email: string
  code: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export const OTPCollection = 'otps'

export class OTPModel {
  static async create(email: string, code: string) {
    const db = await getDb()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes expiry

    const result = await db.collection(OTPCollection).insertOne({
      email,
      code,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })
    return result
  }

  static async verify(email: string, code: string) {
    const db = await getDb()
    const otp = await db.collection(OTPCollection).findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (otp) {
      await db.collection(OTPCollection).updateOne(
        { _id: otp._id },
        { $set: { used: true } }
      )
    }

    return otp
  }
}
