import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { users } from "./schema.js";

async function seed() {
  const existing = await db.select().from(users).where(eq(users.username, "admin"));
  if (existing.length > 0) {
    console.log("Admin user already exists.");
    process.exit(0);
  }

  const hash = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    username: "admin",
    passwordHash: hash,
  });

  console.log("Seeded default user: admin / admin123");
  process.exit(0);
}

seed();
