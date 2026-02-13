import "dotenv/config";
import { prisma } from "../src/prisma.js";
import { getUserByEmail } from "../src/firebaseAdmin.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/bootstrap-admin.mjs <email>");
  process.exit(1);
}

const fbUser = await getUserByEmail(email);

const user = await prisma.user.upsert({
  where: { firebaseUid: fbUser.uid },
  update: { email: fbUser.email, role: "ADMIN", name: fbUser.displayName || null },
  create: { firebaseUid: fbUser.uid, email: fbUser.email, role: "ADMIN", name: fbUser.displayName || null },
});

console.log("Bootstrapped ADMIN:", { id: user.id, email: user.email, role: user.role });
await prisma.$disconnect();
