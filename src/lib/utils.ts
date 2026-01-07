import bcrypt from "bcryptjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scorePassword(password: string) {
  if (!password) return -1;

  let score = 0;
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return score;
}

export function getStrengthInfo(score: number) {
  if (score === -1) return { label: "", color: "", percent: 0 };

  const levels = [
    { label: "Poor", color: "#9d9d9d", percent: 25 },
    { label: "Common", color: "#1eff00", percent: 50 },
    { label: "Rare", color: "#0070dd", percent: 75 },
    { label: "Epic", color: "#a335ee", percent: 100 },
  ];

  return levels[Math.min(score - 1, levels.length - 1)] || levels[0];
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
