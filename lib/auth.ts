import { cookies } from "next/headers";
import { connectDB } from "./db";
import { User } from "@/models/user.model";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

const SESSION_COOKIE = "sessionUser";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    // PERBAIKAN: Tambahkan await di sini karena Next.js 15+ mewajibkannya
    const cookieStore = await cookies();

    const rawCookie = cookieStore.get(SESSION_COOKIE);

    if (!rawCookie || !rawCookie.value) return null;

    // Parsing JSON cookie
    const parsed = JSON.parse(rawCookie.value) as { id: string };

    await connectDB();
    const user = await User.findById(parsed.id).lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

export async function setSessionUser(user: SessionUser) {
  // PERBAIKAN: Tambahkan await
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    JSON.stringify({ id: user.id }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // secure: process.env.NODE_ENV === "production", // Opsional: aktifkan jika sudah deploy HTTPS
    }
  );
}

export async function clearSessionUser() {
  // PERBAIKAN: Tambahkan await
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}