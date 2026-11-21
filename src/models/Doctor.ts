import { Schema, model, type InferSchemaType } from "mongoose";

export const SPECIALIZATIONS = [
  "Allergy & Immunology",
  "Anesthesiology",
  "Cardiac Surgery",
  "Cardiology",
  "Dentistry",
  "Dermatology",
  "Diabetology",
  "Emergency Medicine",
  "Endocrinology",
  "ENT (Otolaryngology)",
  "Family Medicine",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Geriatrics",
  "Gynecology & Obstetrics",
  "Hematology",
  "Hepatology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Nutrition & Dietetics",
  "Oncology",
  "Ophthalmology",
  "Oral & Maxillofacial Surgery",
  "Orthopedics",
  "Pathology",
  "Pediatric Surgery",
  "Pediatrics",
  "Physical Medicine & Rehabilitation",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Sports Medicine",
  "Urology",
  "Vascular Surgery",
] as const;

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialization: {
      type: String,
      required: true,
      trim: true,
      enum: SPECIALIZATIONS,
    },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    area: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
  },
  { timestamps: true }
);

// Filter by specialization, newest first.
doctorSchema.index({ specialization: 1, createdAt: -1 });
// Default list order / date-range filter.
doctorSchema.index({ createdAt: -1 });
// Sort or prefix search by name.
doctorSchema.index({ name: 1 });

export type Doctor = InferSchemaType<typeof doctorSchema>;

export const DoctorModel = model("Doctor", doctorSchema);
