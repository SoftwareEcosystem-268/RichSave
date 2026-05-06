import { NextRequest, NextResponse } from "next/server";
import { DealModel } from "@/lib/models";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MOCK_DEALS = [
  {
    id: "mock-1",
    _id: "mock-1",
    title: "ซูปเปอร์แซ่บ แนวกินอีสาน",
    description: "ตำปูปลาร้า + คอหมูย่าง เซ็ตคู่ราคาพิเศษ",
    discount: "35%",
    originalPrice: 115,
    discountedPrice: 74,
    storeName: "ซูปเปอร์แซ่บ",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop",
    location: { lat: 18.2866, lng: 99.4951, address: "มธ.ลำปาง" },
    expiresAt: new Date(Date.now() + 7 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-2",
    _id: "mock-2",
    title: "Pizza Hut ส่วนลดพิเศษ",
    description: "พิซซ่าซื้อ 1 แถม 1 ทุกเมนู",
    discount: "40%",
    originalPrice: 350,
    discountedPrice: 210,
    storeName: "Pizza Hut",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    location: { lat: 18.291, lng: 99.498, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 2 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-3",
    _id: "mock-3",
    title: "Amazon Coffee ลด 20%",
    description: "กาแฟและเครื่องดื่มทุกแก้วลด 20% เมื่อสั่งผ่านแอพ",
    discount: "20%",
    originalPrice: 80,
    discountedPrice: 64,
    storeName: "Amazon Coffee",
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    location: { lat: 18.288, lng: 99.494, address: "ใกล้มธ.ลำปาง" },
    expiresAt: new Date(Date.now() + 14 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-4",
    _id: "mock-4",
    title: "Swensen's Ice Cream",
    description: "ซื้อ 1 แถม 1 ทุกไอศกรีม 1 สกูป",
    discount: "50%",
    originalPrice: 120,
    discountedPrice: 60,
    storeName: "Swensen's",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400&h=300&fit=crop",
    location: { lat: 18.293, lng: 99.501, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 5 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-5",
    _id: "mock-5",
    title: "บ้านสลัด สดใหม่ทุกวัน",
    description: "สลัดผักออร์แกนิคพร้อมน้ำสลัดสูตรพิเศษ",
    discount: "15%",
    originalPrice: 89,
    discountedPrice: 76,
    storeName: "บ้านสลัด",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    location: { lat: 18.284, lng: 99.492, address: "ถ.พหลโยธิน ลำปาง" },
    expiresAt: new Date(Date.now() + 30 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-6",
    _id: "mock-6",
    title: "Major Cineplex ลด 30%",
    description: "ตั๋วหนังทุกรอบวันธรรมดา ลด 30%",
    discount: "30%",
    originalPrice: 200,
    discountedPrice: 140,
    storeName: "Major Cineplex",
    category: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop",
    location: { lat: 18.295, lng: 99.503, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 10 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-7",
    _id: "mock-7",
    title: "Uniqlo ลดทั้งร้าน",
    description: "เสื้อผ้าทุกชิ้นลด 25% เฉพาะสุดสัปดาห์",
    discount: "25%",
    originalPrice: 590,
    discountedPrice: 443,
    storeName: "Uniqlo",
    category: "Shopping",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop",
    location: { lat: 18.292, lng: 99.499, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 3 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mock-8",
    _id: "mock-8",
    title: "Starbucks Happy Hour",
    description: "กาแฟและเครื่องดื่ม Frappuccino ลด 50% ช่วง 14:00-17:00",
    discount: "50%",
    originalPrice: 165,
    discountedPrice: 83,
    storeName: "Starbucks",
    category: "Drinks",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    location: { lat: 18.289, lng: 99.496, address: "Central ลำปาง" },
    expiresAt: new Date(Date.now() + 1 * 86400000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/deals - Get all deals or search/filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const nearby = searchParams.get("nearby");
    const lat = nearby ? searchParams.get("lat") : null;
    const lng = nearby ? searchParams.get("lng") : null;

    let deals;

    if (query) {
      deals = await DealModel.search(query);
    } else if (category && category !== "All") {
      deals = await DealModel.findByCategory(category);
    } else if (nearby && lat && lng) {
      deals = await DealModel.findNearby(parseFloat(lat), parseFloat(lng));
    } else {
      deals = await DealModel.findAll();
    }

    // Fallback to mock data if DB is empty
    if (!deals || deals.length === 0) {
      let mock = MOCK_DEALS;
      if (query) {
        const q = query.toLowerCase();
        mock = mock.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.storeName.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q),
        );
      }
      if (category && category !== "All")
        mock = mock.filter((d) => d.category === category);
      return NextResponse.json({ success: true, deals: mock });
    }

    // Convert _id to string for JSON serialization
    const serializedDeals = deals.map((deal) => ({
      ...deal,
      _id: deal._id!.toString(),
      id: deal._id!.toString(),
    }));

    return NextResponse.json({
      success: true,
      deals: serializedDeals,
    });
  } catch (error) {
    console.error("Get deals error:", error);
    // On any DB error, return mock data
    return NextResponse.json({ success: true, deals: MOCK_DEALS });
  }
}

// POST /api/deals - Create a new deal (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check
    // const user = getUserFromToken(token)
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    const body = await request.json();
    const {
      title,
      description,
      discount,
      originalPrice,
      discountedPrice,
      storeName,
      image,
      category,
      location,
      expiresAt,
      terms,
    } = body;

    // Validate required fields
    if (
      !title ||
      !originalPrice ||
      !discountedPrice ||
      !storeName ||
      !category ||
      !expiresAt
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await DealModel.create({
      title,
      description: description || "",
      discount,
      originalPrice,
      discountedPrice,
      storeName,
      image: image || "",
      category,
      location,
      expiresAt: new Date(expiresAt),
      terms,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Deal created successfully",
    });
  } catch (error) {
    console.error("Create deal error:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 },
    );
  }
}
