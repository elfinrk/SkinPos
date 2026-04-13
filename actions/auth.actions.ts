"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { setSessionUser, clearSessionUser } from "@/lib/auth";

export async function registerAction(formData: FormData) {
  await connectDB();

  const name = String(formData.get("name"));
  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));

  if (!name || !email || !password) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  const exist = await User.findOne({ email });
  if (exist) return { success: false, message: "Email sudah terdaftar." };

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
  });

  // PERBAIKAN: Pakai await di sini
  await setSessionUser({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: "user",
  });

  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  await connectDB();

  const email = String(formData.get("email")).toLowerCase();
  const password = String(formData.get("password"));

  const user = await User.findOne({ email });
  if (!user) return { success: false, message: "Email atau password salah." };

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return { success: false, message: "Email atau password salah." };

  // PERBAIKAN: Pakai await di sini
  await setSessionUser({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  // PERBAIKAN: Pakai await di sini
  await clearSessionUser();
  redirect("/");
}