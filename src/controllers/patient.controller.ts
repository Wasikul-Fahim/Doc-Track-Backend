import type { RequestHandler } from "express";
import {
  createPatient,
  deletePatient,
  getPatientById,
  listPatients,
  updatePatient,
} from "../services/patient.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import type {
  CreatePatientInput,
  PatientQuery,
  UpdatePatientInput,
} from "../validators/patient.validator";

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const { data, meta } = await listPatients(req.query as unknown as PatientQuery);
  sendSuccess(res, data, 200, meta);
});

export const getOne: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await getPatientById(req.params.id));
});

export const create: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await createPatient(req.body as CreatePatientInput), 201);
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await updatePatient(req.params.id, req.body as UpdatePatientInput));
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, await deletePatient(req.params.id));
});
