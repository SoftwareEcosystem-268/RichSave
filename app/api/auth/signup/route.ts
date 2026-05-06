import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/lib/models";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 },
      );
    }

    // Create user
    await UserModel.create({
      name,
      email,
      password,
      favorites: [],
      preferences: {
        pushNotifications: true,
        locationServices: true,
        darkMode: false,
      },
    });

    // Get the created user
    const user = await UserModel.findByEmail(email);

    // Generate token
    const token = generateToken({
      userId: user!._id!.toString(),
      email: user!.email,
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user!._id!.toString(),
        name: user!.name,
        email: user!.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ?? false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
