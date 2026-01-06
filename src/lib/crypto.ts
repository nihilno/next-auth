import bcrypt from "bcryptjs";

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
