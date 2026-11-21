import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/overview", analyticsController.overview);

export default router;
