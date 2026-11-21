import type { FilterQuery, Types } from "mongoose";
import { DoctorModel, type Doctor } from "../models/Doctor";
import { PatientModel } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import { buildMeta } from "../utils/pagination";
import { escapeRegex, parseSort } from "../utils/query";
import type {
  CreateDoctorInput,
  DoctorQuery,
  UpdateDoctorInput,
} from "../validators/doctor.validator";

const SORTABLE = ["name", "specialization", "hospital", "area", "createdAt"] as const;
const PROJECTION = "name specialization hospital area phone email createdAt updatedAt";

async function countPatientsFor(doctorIds: Types.ObjectId[]) {
  if (doctorIds.length === 0) return new Map<string, number>();

  // One $group for the whole page — never one count query per doctor.
  const rows = await PatientModel.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    { $match: { doctorId: { $in: doctorIds } } },
    { $group: { _id: "$doctorId", count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function listDoctors(query: DoctorQuery) {
  const filter: FilterQuery<Doctor> = {};

  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { name: rx },
      { email: rx },
      { hospital: rx },
      { area: rx },
      { specialization: rx },
    ];
  }

  if (query.specialization) {
    filter.specialization = query.specialization;
  }

  if (query.area) {
    filter.area = new RegExp(escapeRegex(query.area), "i");
  }

  if (query.hospital) {
    filter.hospital = new RegExp(escapeRegex(query.hospital), "i");
  }

  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from ? { $gte: query.from } : {}),
      // Date-only input parses to midnight; include the whole "to" day.
      ...(query.to ? { $lte: new Date(query.to.getTime() + 86_400_000 - 1) } : {}),
    };
  }

  const sort = parseSort(query.sort, SORTABLE);
  const skip = (query.page - 1) * query.limit;

  // count and find do not depend on each other, so run them in parallel.
  const [doctors, total] = await Promise.all([
    DoctorModel.find(filter)
      .select(PROJECTION)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .lean(),
    DoctorModel.countDocuments(filter),
  ]);

  const counts = await countPatientsFor(doctors.map((doctor) => doctor._id));

  return {
    data: doctors.map((doctor) => ({
      ...doctor,
      patientCount: counts.get(String(doctor._id)) ?? 0,
    })),
    meta: buildMeta(total, query.page, query.limit),
  };
}

export async function listDoctorOptions() {
  return DoctorModel.find()
    .select("name specialization")
    .sort({ name: 1 })
    .limit(500)
    .lean();
}

export async function getDoctorById(id: string) {
  const doctor = await DoctorModel.findById(id).select(PROJECTION).lean();

  if (!doctor) throw ApiError.notFound("Doctor not found");

  const patientCount = await PatientModel.countDocuments({ doctorId: id });

  return { ...doctor, patientCount };
}

export async function createDoctor(input: CreateDoctorInput) {
  const doctor = await DoctorModel.create(input);
  return doctor.toObject();
}

export async function updateDoctor(id: string, input: UpdateDoctorInput) {
  const doctor = await DoctorModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
    .select(PROJECTION)
    .lean();

  if (!doctor) throw ApiError.notFound("Doctor not found");

  return doctor;
}

export async function deleteDoctor(id: string) {
  const patientCount = await PatientModel.countDocuments({ doctorId: id });

  if (patientCount > 0) {
    throw ApiError.conflict(
      "DOCTOR_HAS_PATIENTS",
      `This doctor still has ${patientCount} patient(s). Reassign or delete them first.`
    );
  }

  const doctor = await DoctorModel.findByIdAndDelete(id).lean();

  if (!doctor) throw ApiError.notFound("Doctor not found");

  return { id };
}
