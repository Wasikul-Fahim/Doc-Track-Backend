import { Router } from "express";
import analyticsRoutes from "./analytics.routes";
import authRoutes from "./auth.routes";
import doctorRoutes from "./doctor.routes";
import patientRoutes from "./patient.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
