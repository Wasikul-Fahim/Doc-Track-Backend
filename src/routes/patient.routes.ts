import { Router } from "express";
import * as patientController from "../controllers/patient.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamsSchema } from "../validators/common.validator";
import {
  createPatientSchema,
  patientQuerySchema,
  updatePatientSchema,
} from "../validators/patient.validator";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  validate({ query: patientQuerySchema }),
  patientController.list
);

router.post(
  "/",
  validate({ body: createPatientSchema }),
  patientController.create
);

router.get(
  "/:id",
  validate({ params: idParamsSchema }),
  patientController.getOne
);

router.patch(
  "/:id",
  validate({ params: idParamsSchema, body: updatePatientSchema }),
  patientController.update
);

router.delete(
  "/:id",
  validate({ params: idParamsSchema }),
  patientController.remove
);

export default router;
