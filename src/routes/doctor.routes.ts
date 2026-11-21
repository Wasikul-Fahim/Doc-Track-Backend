import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamsSchema } from "../validators/common.validator";
import {
  createDoctorSchema,
  doctorQuerySchema,
  updateDoctorSchema,
} from "../validators/doctor.validator";

const router = Router();

router.use(requireAuth);

// Declared before /:id so "options" is not mistaken for an id.
router.get("/options", doctorController.options);

router.get(
  "/",
  validate({ query: doctorQuerySchema }),
  doctorController.list
);

router.post(
  "/",
  validate({ body: createDoctorSchema }),
  doctorController.create
);

router.get(
  "/:id",
  validate({ params: idParamsSchema }),
  doctorController.getOne
);

router.patch(
  "/:id",
  validate({ params: idParamsSchema, body: updateDoctorSchema }),
  doctorController.update
);

router.delete(
  "/:id",
  validate({ params: idParamsSchema }),
  doctorController.remove
);

export default router;
