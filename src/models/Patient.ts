import { Schema, model, type InferSchemaType } from "mongoose";

export const PATIENT_STATUSES = ["admitted", "discharged", "critical"] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, required: true, enum: GENDERS },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    condition: { type: String, required: true, trim: true, maxlength: 120 },
    status: {
      type: String,
      required: true,
      enum: PATIENT_STATUSES,
      default: "admitted",
    },
    admittedAt: { type: Date, required: true, default: Date.now },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

// One doctor's patients, optionally filtered by status, newest admissions first.
patientSchema.index({ doctorId: 1, status: 1, admittedAt: -1 });
// One doctor's patients, newest first (status not filtered).
patientSchema.index({ doctorId: 1, admittedAt: -1 });
// Status board across all doctors.
patientSchema.index({ status: 1, admittedAt: -1 });
// Recent admissions / dashboard date buckets.
patientSchema.index({ admittedAt: -1 });
// Grouping "top conditions" in the dashboard.
patientSchema.index({ condition: 1 });
// Sort or prefix search by name.
patientSchema.index({ name: 1 });

export type Patient = InferSchemaType<typeof patientSchema>;

export const PatientModel = model("Patient", patientSchema);
