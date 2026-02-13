import { verifyIdToken } from "./firebaseAdmin.js";
import { prisma } from "./prisma.js";

export function authRequired() {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization || "";
      const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ message: "Missing Bearer token" });

      const decoded = await verifyIdToken(token);
      const email = decoded.email || "";
      if (!email) return res.status(401).json({ message: "Token has no email" });

      const user = await prisma.user.upsert({
        where: { firebaseUid: decoded.uid },
        update: { email },
        create: { firebaseUid: decoded.uid, email, name: decoded.name || null },
      });

      req.user = user;
      req.firebase = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Unauthorized", error: String(e?.message || e) });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
