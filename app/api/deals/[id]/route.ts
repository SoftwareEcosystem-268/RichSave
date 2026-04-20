import { NextRequest, NextResponse } from "next/server";
import { DealModel, RedemptionModel } from "@/lib/models";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const MOCK_DEALS: Record<string, any> = {
  "mock-1": {
    id: "mock-1",
    title: "ซูปเปอร์แซ่บ แนวกินอีสาน",
    description: "ตำปูปลาร้า + คอหมูย่าง เซ็ตคู่ราคาพิเศษ",
    discount: "35%",
    originalPrice: 115,
    discountedPrice: 74,
    storeName: "ซูปเปอร์แซ่บ",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=400&fit=crop",
    location: { lat: 18.2866, lng: 99.4951, address: "มธ.ลำปาง" },
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    terms: ["ใช้ได้ 1 ครั้งต่อคน", "ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่น"],
    isActive: true,
  },
  "mock-2": {
    id: "mock-2",
    title: "Pizza Hut ส่วนลดพิเศษ",
    description: "ซื้อ 1 แถม 1 ทุกเมนูพิซซ่า",
    discount: "40%",
    originalPrice: 350,
    discountedPrice: 210,
    storeName: "Pizza Hut",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
    location: { lat: 18.291, lng: 99.498, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    terms: ["ใช้ได้ที่สาขาที่ร่วมรายการเท่านั้น"],
    isActive: true,
  },
  "mock-3": {
    id: "mock-3",
    title: "Amazon Coffee ลด 20%",
    description: "เครื่องดื่มทุกแก้วลด 20% เมื่อสั่งผ่านแอพ",
    discount: "20%",
    originalPrice: 80,
    discountedPrice: 64,
    storeName: "Amazon Coffee",
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop",
    location: { lat: 18.288, lng: 99.494, address: "ใกล้มธ.ลำปาง" },
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    terms: ["ใช้ได้ 1 ครั้งต่อคนต่อวัน"],
    isActive: true,
  },
  "mock-4": {
    id: "mock-4",
    title: "Swensen's Ice Cream",
    description: "ซื้อ 1 แถม 1 ทุกไอศกรีม 1 สกูป",
    discount: "50%",
    originalPrice: 120,
    discountedPrice: 60,
    storeName: "Swensen's",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&h=400&fit=crop",
    location: { lat: 18.293, lng: 99.501, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    terms: ["ใช้ได้เฉพาะวันธรรมดา"],
    isActive: true,
  },
  "mock-5": {
    id: "mock-5",
    title: "บ้านสลัด สดใหม่ทุกวัน",
    description: "สลัดผักออร์แกนิคพร้อมน้ำสลัดสูตรพิเศษ",
    discount: "15%",
    originalPrice: 89,
    discountedPrice: 76,
    storeName: "บ้านสลัด",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop",
    location: { lat: 18.284, lng: 99.492, address: "ถ.พหลโยธิน ลำปาง" },
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    terms: ["ไม่มีขั้นต่ำ"],
    isActive: true,
  },
  "mock-6": {
    id: "mock-6",
    title: "Major Cineplex ลด 30%",
    description: "ตั๋วหนังทุกรอบวันธรรมดา ลด 30%",
    discount: "30%",
    originalPrice: 200,
    discountedPrice: 140,
    storeName: "Major Cineplex",
    category: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
    location: { lat: 18.295, lng: 99.503, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 10 * 86400000).toISOString(),
    terms: ["วันธรรมดาเท่านั้น", "ไม่รวมรอบ Premium"],
    isActive: true,
  },
  "mock-7": {
    id: "mock-7",
    title: "Uniqlo ลดทั้งร้าน",
    description: "เสื้อผ้าทุกชิ้นลด 25% เฉพาะสุดสัปดาห์",
    discount: "25%",
    originalPrice: 590,
    discountedPrice: 443,
    storeName: "Uniqlo",
    category: "Shopping",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=400&fit=crop",
    location: { lat: 18.292, lng: 99.499, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    terms: ["เสาร์-อาทิตย์เท่านั้น"],
    isActive: true,
  },
  "mock-8": {
    id: "mock-8",
    title: "Starbucks Happy Hour",
    description: "เครื่องดื่ม Frappuccino ลด 50% ช่วง 14:00-17:00",
    discount: "50%",
    originalPrice: 165,
    discountedPrice: 83,
    storeName: "Starbucks",
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=400&fit=crop",
    location: { lat: 18.289, lng: 99.496, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 1 * 86400000).toISOString(),
    terms: ["14:00-17:00 เท่านั้น", "เมนู Frappuccino เท่านั้น"],
    isActive: true,
  },
};

// GET /api/deals/[id] - Get a single deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Return mock immediately for mock IDs
  if (MOCK_DEALS[params.id]) {
    return NextResponse.json({ success: true, deal: MOCK_DEALS[params.id] });
  }

  try {
    const deal = await DealModel.findById(params.id);

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deal: { ...deal, _id: deal._id!.toString(), id: deal._id!.toString() },
    });
  } catch (error) {
    console.error("Get deal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 },
    );
  }
}

// POST /api/deals/[id]/redeem - Redeem a deal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const deal = await DealModel.findById(params.id);
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Create redemption record
    const savings = deal.originalPrice - deal.discountedPrice;
    await RedemptionModel.create({
      userId: new ObjectId(user.userId),
      dealId: deal._id!.toString(),
      dealTitle: deal.title,
      storeName: deal.storeName,
      savings,
      redeemedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Deal redeemed successfully",
      savings,
    });
  } catch (error) {
    console.error("Redeem deal error:", error);
    return NextResponse.json(
      { error: "Failed to redeem deal" },
      { status: 500 },
    );
  }
}
