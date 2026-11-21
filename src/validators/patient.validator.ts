import { z } from "zod";
import { GENDERS, PATIENT_STATUSES } from "../models/Patient";
import {
  checkDateRange,
  dateRangeFields,
  objectIdSchema,
  paginationFields,
} from "./common.validator";

const patientFields = {
  name: z.string().trim().min(2, "Name is too short").max(100),
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(120, "Age looks invalid"),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: "Choose a gender" }),
  }),
  phone: z.string().trim().max(30).optional().default(""),
  condition: z.string().trim().min(2, "Condition is required").max(120),
  status: z.enum(PATIENT_STATUSES).default("admitted"),
  admittedAt: z.coerce.date().optional(),
  doctorId: objectIdSchema,
};

export const createPatientSchema = z.object(patientFields);

export const updatePatientSchema = z
  .object(patientFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const patientQuerySchema = z
  .object({
    ...paginationFields,
    search: z.string().trim().max(100).optional(),
    sort: z.string().trim().max(100).optional(),
    status: z.enum(PATIENT_STATUSES).optional(),
    gender: z.enum(GENDERS).optional(),
    doctorId: objectIdSchema.optional(),
    ...dateRangeFields,
  })
  .refine(checkDateRange, {
    message: "`from` must be before `to`",
    path: ["from"],
  });

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientQuery = z.infer<typeof patientQuerySchema>;
