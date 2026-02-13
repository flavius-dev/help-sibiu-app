import express from "express";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { authRequired, requireRole } from "./auth.js";
import { validateBody } from "./validate.js";

export function buildRouter(io) {
  const r = express.Router();

  r.get("/health", (req, res) => res.json({ ok: true, name: "help-sibiu-backend", ts: Date.now() }));

  const createAlertSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
  });

  r.post("/alerts", authRequired(), requireRole("DISPATCHER", "ADMIN"), validateBody(createAlertSchema), async (req, res) => {
    const alert = await prisma.alert.create({ data: { ...req.body, createdById: req.user.id } });
    io.emit("alert:new", alert);
    res.json(alert);
  });

  r.get("/alerts", authRequired(), async (req, res) => {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      include: { assignments: { include: { user: true } }, createdBy: true },
      take: 200,
    });
    res.json(alerts);
  });

  r.post("/alerts/:id/accept", authRequired(), requireRole("VOLUNTEER", "ADMIN"), async (req, res) => {
    const alertId = req.params.id;
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    if (alert.status !== "ACTIVE") return res.status(400).json({ message: "Alert not active" });

    const assignment = await prisma.alertAssignment.upsert({
      where: { alertId_userId: { alertId, userId: req.user.id } },
      update: {},
      create: { alertId, userId: req.user.id, status: "ACCEPTED" },
    });

    io.emit("alert:accepted", { alertId, userId: req.user.id, assignment });
    res.json({ ok: true, assignment });
  });

  r.post("/alerts/:id/status", authRequired(), requireRole("DISPATCHER", "ADMIN"), async (req, res) => {
    const schema = z.object({ status: z.enum(["ACTIVE","RESOLVED","CANCELED"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });

    const alert = await prisma.alert.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    io.emit("alert:status", { alertId: alert.id, status: alert.status });
    res.json(alert);
  });

  const zoneSchema = z.object({ name: z.string().min(2), geojson: z.any(), risk: z.number().min(0).max(1).optional() });
  r.post("/zones", authRequired(), requireRole("DISPATCHER", "ADMIN"), validateBody(zoneSchema), async (req, res) => {
    const risk = typeof req.body.risk === "number" ? req.body.risk : Math.random();
    const zone = await prisma.zone.create({ data: { name: req.body.name, geojson: req.body.geojson, risk } });
    io.emit("zone:new", zone);
    res.json(zone);
  });

  r.get("/zones", authRequired(), async (req, res) => {
    const zones = await prisma.zone.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    res.json(zones);
  });

  r.get("/stats/summary", authRequired(), requireRole("DISPATCHER", "ADMIN"), async (req, res) => {
    const [alertsTotal, active, resolved, zones] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { status: "ACTIVE" } }),
      prisma.alert.count({ where: { status: "RESOLVED" } }),
      prisma.zone.findMany({ take: 200 }),
    ]);
    const avgRisk = zones.length ? zones.reduce((s,z)=>s+(z.risk||0),0)/zones.length : 0;
    res.json({ alertsTotal, active, resolved, zonesTotal: zones.length, avgRisk });
  });

  const setRoleSchema = z.object({ userId: z.string(), role: z.enum(["ADMIN","DISPATCHER","VOLUNTEER"]) });
  r.get("/admin/users", authRequired(), requireRole("ADMIN"), async (req, res) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    res.json(users);
  });
  r.post("/admin/set-role", authRequired(), requireRole("ADMIN"), validateBody(setRoleSchema), async (req, res) => {
    const u = await prisma.user.update({ where: { id: req.body.userId }, data: { role: req.body.role } });
    io.emit("user:role", { userId: u.id, role: u.role });
    res.json(u);
  });

  return r;
}
