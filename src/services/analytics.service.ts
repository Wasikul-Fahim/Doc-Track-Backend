import { DoctorModel } from "../models/Doctor";
import { PatientModel, PATIENT_STATUSES } from "../models/Patient";

const MONTHS = 12;

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export async function getOverview() {
  const now = new Date();
  const rangeStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1), 1)
  );

  const [[patientStats], [doctorStats]] = await Promise.all([
    PatientModel.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                patients: { $sum: 1 },
                avgAge: { $avg: "$age" },
              },
            },
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          admissionsByMonth: [
            { $match: { admittedAt: { $gte: rangeStart } } },
            {
              $group: {
                _id: {
                  $dateTrunc: { date: "$admittedAt", unit: "month" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topConditions: [
            { $group: { _id: "$condition", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 5 },
          ],
          patientsPerDoctor: [
            { $group: { _id: "$doctorId", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 8 },
            {
              $lookup: {
                from: "doctors",
                localField: "_id",
                foreignField: "_id",
                as: "doctor",
              },
            },
            { $unwind: "$doctor" },
            {
              $project: {
                _id: 0,
                doctorId: { $toString: "$_id" },
                name: "$doctor.name",
                specialization: "$doctor.specialization",
                area: "$doctor.area",
                count: 1,
              },
            },
          ],
        },
      },
    ]),
    DoctorModel.aggregate([
      {
        $facet: {
          totals: [{ $count: "count" }],
          bySpecialization: [
            { $group: { _id: "$specialization", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
        },
      },
    ]),
  ]);

  const totalsRow = (patientStats?.totals?.[0] ?? {}) as {
    patients?: number;
    avgAge?: number | null;
  };

  const statusCounts = new Map<string, number>(
    (patientStats?.byStatus ?? []).map((row: { _id: string; count: number }) => [
      row._id,
      row.count,
    ])
  );

  // Fill every month in the window so the chart never has holes.
  const buckets = new Map<string, number>();
  for (let index = 0; index < MONTHS; index += 1) {
    const date = new Date(
      Date.UTC(
        rangeStart.getUTCFullYear(),
        rangeStart.getUTCMonth() + index,
        1
      )
    );
    buckets.set(monthKey(date), 0);
  }
  for (const row of patientStats?.admissionsByMonth ?? []) {
    const key = monthKey(new Date(row._id as Date));
    if (buckets.has(key)) buckets.set(key, row.count as number);
  }

  const patients = totalsRow.patients ?? 0;
  const avgAge = typeof totalsRow.avgAge === "number" ? totalsRow.avgAge : null;

  return {
    totals: {
      doctors: doctorStats?.totals?.[0]?.count ?? 0,
      patients,
      critical: statusCounts.get("critical") ?? 0,
      admitted: statusCounts.get("admitted") ?? 0,
      discharged: statusCounts.get("discharged") ?? 0,
      avgAge: avgAge === null ? null : Math.round(avgAge * 10) / 10,
    },
    statusBreakdown: PATIENT_STATUSES.map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
    })),
    admissionsByMonth: [...buckets.entries()].map(([month, count]) => ({
      month,
      count,
    })),
    topConditions: (patientStats?.topConditions ?? []).map(
      (row: { _id: string; count: number }) => ({
        condition: row._id,
        count: row.count,
      })
    ),
    patientsPerDoctor: patientStats?.patientsPerDoctor ?? [],
    specializationBreakdown: (doctorStats?.bySpecialization ?? []).map(
      (row: { _id: string; count: number }) => ({
        specialization: row._id,
        count: row.count,
      })
    ),
  };
}
