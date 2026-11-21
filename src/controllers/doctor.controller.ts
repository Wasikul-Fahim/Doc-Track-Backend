import type { RequestHandler } from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  listDoctorOptions,
  listDoctors,
  updateDoctor,
} from "../services/doctor.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import type {
  CreateDoctorInput,
  DoctorQuery,
  UpdateDoctorInput,
} from "../validators/doctor.validator";

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const { data, meta } = await listDoctors(req.query as unknown as DoctorQuery);
  sendSuccess(res, data, 200, meta);
});

export const options: RequestHandler = asyncHandler(async (_req, res) => {
  sendSuccess(res, await listDoctorOptions());
});

export const getOne: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await getDoctorById(req.params.id));
});

export const create: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await createDoctor(req.body as CreateDoctorInput), 201);
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateDoctor(req.params.id, req.body as UpdateDoctorInput));
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteDoctor(req.params.id));
});
