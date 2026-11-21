import { z } from "zod";
import { SPECIALIZATIONS } from "../models/Doctor";
import {
  checkDateRange,
  dateRangeFields,
  paginationFields,
} from "./common.validator";

// Accepts "01712-345678", "+880 1712 345678", "8801712345678" etc. and returns
// the local 11-digit form ("01712345678") that we store.
function normalizeBdPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("880") ? `0${digits.slice(3)}` : digits;
}

const doctorFields = {
  name: z.string().trim().min(2, "Name is too short").max(100),
  specialization: z.enum(SPECIALIZATIONS, {
    errorMap: () => ({ message: "Choose a specialization" }),
  }),
  hospital: z.string().trim().min(2, "Hospital is required").max(150),
  area: z.string().trim().min(2, "Area is required").max(100),
  phone: z
    .string()
    .trim()
    .transform(normalizeBdPhone)
    .refine((value) => /^01[3-9]\d{8}$/.test(value), {
      message: "Enter a valid Bangladeshi mobile number (01XXX-XXXXXX)",
    }),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
};

export const createDoctorSchema = z.object(doctorFields);

export const updateDoctorSchema = z
  .object(doctorFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const doctorQuerySchema = z
  .object({
    ...paginationFields,
    search: z.string().trim().max(100).optional(),
    sort: z.string().trim().max(100).optional(),
    specialization: z.enum(SPECIALIZATIONS).optional(),
    area: z.string().trim().max(100).optional(),
    hospital: z.string().trim().max(150).optional(),
    ...dateRangeFields,
  })
  .refine(checkDateRange, {
    message: "`from` must be before `to`",
    path: ["from"],
  });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
