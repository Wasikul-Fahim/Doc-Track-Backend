import type { FilterQuery } from "mongoose";
import { DoctorModel } from "../models/Doctor";
import { PatientModel, PATIENT_STATUSES, type Patient } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import { buildMeta } from "../utils/pagination";
import { escapeRegex, parseSort } from "../utils/query";
import type {
  CreatePatientInput,
  PatientQuery,
  UpdatePatientInput,
} from "../validators/patient.validator";

const SORTABLE = [
  "name",
  "age",
  "status",
  "condition",
  "admittedAt",
  "createdAt",
] as const;

const PROJECTION =
  "name age gender phone condition status admittedAt doctorId createdAt updatedAt";

const DOCTOR_FIELDS = "name specialization";

async function assertDoctorExists(doctorId: string) {
  const exists = await DoctorModel.exists({ _id: doctorId });
  if (!exists) {
    throw ApiError.badRequest("The selected doctor does not exist");
  }
}

function buildFilter(query: PatientQuery): FilterQuery<Patient> {
  const filter: FilterQuery<Patient> = {};

  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { condition: rx }];
  }

  if (query.status) filter.status = query.status;
  if (query.gender) filter.gender = query.gender;
  if (query.doctorId) filter.doctorId = query.doctorId;

  if (query.from || query.to) {
    filter.admittedAt = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    };
  }

  return filter;
}

export async function listPatients(query: PatientQuery) {
  const filter = buildFilter(query);
  const sort = parseSort(query.sort, SORTABLE, "-admittedAt");
  const skip = (query.page - 1) * query.limit;

  const [patients, total] = await Promise.all([
    PatientModel.find(filter)
      .select(PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate("doctorId", DOCTOR_FIELDS)
      .lean(),
    PatientModel.countDocuments(filter),
  ]);

  return {
    data: patients,
    meta: buildMeta(total, query.page, query.limit),
  };
}

export async function getPatientById(id: string) {
  const patient = await PatientModel.findById(id)
    .select(PROJECTION)
    .populate("doctorId", DOCTOR_FIELDS)
    .lean();

  if (!patient) throw ApiError.notFound("Patient not found");

  return patient;
}

export async function createPatient(input: CreatePatientInput) {
  await assertDoctorExists(input.doctorId);

  const created = await PatientModel.create(input);

  return PatientModel.findById(created._id)
    .select(PROJECTION)
    .populate("doctorId", DOCTOR_FIELDS)
    .lean();
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  if (input.doctorId) {
    await assertDoctorExists(input.doctorId);
  }

  const patient = await PatientModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
    .select(PROJECTION)
    .populate("doctorId", DOCTOR_FIELDS)
    .lean();

  if (!patient) throw ApiError.notFound("Patient not found");

  return patient;
}

export async function deletePatient(id: string) {
  const patient = await PatientModel.findByIdAndDelete(id).lean();

  if (!patient) throw ApiError.notFound("Patient not found");

  return { id, status: patient.status };
}

export function listStatuses() {
  return PATIENT_STATUSES;
}
