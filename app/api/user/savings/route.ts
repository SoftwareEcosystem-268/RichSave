import { NextRequest, NextResponse } from "next/server";
import { RedemptionModel, UserModel } from "@/lib/models";
import { getUserFromToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/user/savings - Get user's savings data
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "6");

    // Get total savings
    const totalSavings = await RedemptionModel.getTotalSavings(user.userId);

    // Get today savings
    const todaySavings = await RedemptionModel.getTodaySavings(user.userId);

    // Get monthly savings
    const monthlySavings = await RedemptionModel.getMonthlySavings(
      user.userId,
      months,
    );

    // Get recent redemptions
    const recentRedemptions = await RedemptionModel.findByUserId(user.userId);
    const limitedRedemptions = recentRedemptions.slice(0, 10);

    // Get user data for deal count
    const userData = await UserModel.findById(user.userId);
    const dealCount = limitedRedemptions.length;

    return NextResponse.json({
      success: true,
      data: {
        totalSavings,
        todaySavings,
        dealsRedeemed: dealCount,
        avgSavingsPerDeal: dealCount > 0 ? totalSavings / dealCount : 0,
        monthlySavings: monthlySavings.map((m) => ({
          month: new Date(m._id.year, m._id.month - 1).toLocaleString(
            "default",
            { month: "short" },
          ),
          savings: m.savings,
        })),
        recentRedemptions: limitedRedemptions.map((r) => ({
          id: r._id!.toString(),
          dealId: r.dealId,
          title: r.dealTitle,
          storeName: r.storeName,
          savings: r.savings,
          date: r.redeemedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get savings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings data" },
      { status: 500 },
    );
  }
}

// POST /api/user/savings - Record a deal redemption
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { ObjectId } = await import("mongodb");
    const body = await request.json();
    const { dealId, dealTitle, storeName, savings } = body;

    if (!dealId || !dealTitle || !storeName || savings == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await RedemptionModel.create({
      userId: new ObjectId(user.userId),
      dealId: String(dealId),
      dealTitle: String(dealTitle),
      storeName: String(storeName),
      savings: Number(savings),
      redeemedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record redemption error:", error);
    return NextResponse.json(
      { error: "Failed to record redemption" },
      { status: 500 },
    );
  }
}
