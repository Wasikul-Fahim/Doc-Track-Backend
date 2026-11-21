import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../src/config/db";
import { DoctorModel } from "../src/models/Doctor";
import { PatientModel } from "../src/models/Patient";
import { UserModel } from "../src/models/User";

const ADMIN = {
  name: "Admin User",
  email: "admin@doctrack.dev",
  password: "Admin@123",
};

// Deterministic PRNG so every reseed produces the same data.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261120);

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)] as T;

const between = (min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;

const DOCTORS = [
  ["Dr. Ayesha Rahman", "Cardiology", "Dhaka Medical College Hospital", "Dhanmondi, Dhaka", "+880 1711234567"],
  ["Dr. Sayeeda Karim", "Dermatology", "Square Hospital", "Panthapath, Dhaka", "+880 1712345678"],
  ["Dr. Tanvir Ahmed", "Neurology", "Chittagong Medical College Hospital", "Panchlaish, Chattogram", "+880 1713456789"],
  ["Dr. Nusrat Jahan", "Pediatrics", "Bangabandhu Sheikh Mujib Medical University", "Shahbagh, Dhaka", "+880 1714567890"],
  ["Dr. Mahbubur Rahman", "Orthopedics", "Ibn Sina Hospital", "Dhanmondi, Dhaka", "+880 1715678901"],
  ["Dr. Farhana Akter", "General Medicine", "Apollo Hospitals Dhaka", "Bashundhara, Dhaka", "+880 1716789012"],
  ["Dr. Imran Hossain", "Psychiatry", "National Heart Foundation Hospital", "Mirpur, Dhaka", "+880 1717890123"],
  ["Dr. Sharmin Sultana", "Gastroenterology", "Bangabandhu Sheikh Mujib Medical University", "Shahbagh, Dhaka", "+880 1718901234"],
  ["Dr. Kamrul Hasan", "Oncology", "Evercare Hospital", "Bashundhara, Dhaka", "+880 1719012345"],
  ["Dr. Rehana Begum", "Pulmonology", "Labaid Specialized Hospital", "Dhanmondi, Dhaka", "+880 1720123456"],
  ["Dr. Arif Chowdhury", "Endocrinology", "Cumilla Medical College Hospital", "Comilla", "+880 1721234567"],
  ["Dr. Sadia Islam", "Radiology", "Rajshahi Medical College Hospital", "Rajshahi", "+880 1722345678"],
] as const;

const CONDITIONS_BY_SPECIALIZATION: Record<string, string[]> = {
  Cardiology: ["Hypertension", "Arrhythmia", "Heart failure", "Coronary artery disease"],
  Neurology: ["Migraine", "Epilepsy", "Stroke recovery", "Neuropathy"],
  Pediatrics: ["Asthma", "Ear infection", "Bronchitis", "Fever"],
  Orthopedics: ["Fractured femur", "Knee replacement", "Lower back pain", "Arthritis"],
  Dermatology: ["Eczema", "Psoriasis", "Acne", "Cellulitis"],
  "General Medicine": ["Type 2 diabetes", "Influenza", "Hypertension", "Fatigue"],
  Psychiatry: ["Anxiety disorder", "Depression", "Insomnia", "Bipolar disorder"],
  Gastroenterology: ["Gastritis", "IBS", "Liver cirrhosis", "Acid reflux"],
  Oncology: ["Breast cancer", "Lymphoma", "Chemotherapy follow-up", "Leukemia"],
  Pulmonology: ["COPD", "Pneumonia", "Sleep apnea", "Chronic bronchitis"],
  Endocrinology: ["Hypothyroidism", "Type 1 diabetes", "Osteoporosis", "Thyroiditis"],
  Radiology: ["Follow-up imaging", "Suspected fracture", "Chest X-ray review", "MRI assessment"],
};

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Amir", "Nadia", "Hiro",
  "Mei", "Carlos", "Fatima", "Lucas", "Elena", "Kwame", "Priya", "Noah",
  "Olivia", "Ethan", "Ava", "Mason", "Chloe", "Liam", "Zara", "Omar", "Grace",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "King", "Wright",
  "Nguyen", "Patel", "Kim", "Singh", "Khan", "Ali",
];

const STATUSES = [
  ...Array(6).fill("admitted"),
  ...Array(3).fill("discharged"),
  ...Array(2).fill("critical"),
] as const;

async function seed() {
  await connectDatabase();

  await Promise.all([
    UserModel.deleteMany({}),
    DoctorModel.deleteMany({}),
    PatientModel.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(ADMIN.password, 10);
  await UserModel.create({
    name: ADMIN.name,
    email: ADMIN.email,
    passwordHash,
    role: "admin",
  });

  const doctors = await DoctorModel.insertMany(
    DOCTORS.map(([name, specialization, hospital, area, phone]) => ({
      name,
      specialization,
      hospital,
      area,
      phone: phone.replace(/^\+880\s*/, "0"),
      email: `${name
        .replace(/^Dr\.\s*/, "")
        .toLowerCase()
        .replace(/[^a-z]+/g, ".")}@careguide.dev`,
    }))
  );

  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;

  const BANGLADESHI_FIRST_NAMES = [
  "Rakib", "Sabbir", "Tanvir", "Arif", "Imran", "Kamal", "Rahim", "Karim",
  "Hasan", "Mahmud", "Fahim", "Nayeem", "Sohel", "Jashim", "Ripon",
  "Munir", "Shahin", "Anwar", "Belal", "Delwar", "Emon", "Faruk", "Golam",
  "Habib", "Iqbal",
  "Nusrat", "Farhana", "Sharmin", "Sadia", "Rehana", "Ayesha", "Taslima",
  "Rumana", "Salma", "Nazma", "Rina", "Moushumi", "Sumaiya", "Jannat",
  "Afsana", "Hasina", "Laila", "Marufa", "Nasrin", "Parvin", "Roksana",
  "Shilpi", "Tania", "Urmi",
];

const BANGLADESHI_LAST_NAMES = [
  "Islam", "Hossain", "Rahman", "Ahmed", "Akter", "Sultana", "Begum",
  "Chowdhury", "Khan", "Uddin", "Alam", "Bhuiyan", "Mia", "Das", "Roy",
  "Sarkar", "Haque", "Karim", "Molla", "Talukder", "Sheikh", "Ali",
  "Siddique", "Mahmud",
];

const STATUSES = [
  ...Array(6).fill("admitted"),
  ...Array(3).fill("discharged"),
  ...Array(2).fill("critical"),
] as const;

const random = mulberry32(20261120);

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)] as T;

const between = (min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;

const patients = Array.from({ length: 220 }, () => {
  const doctor = pick(doctors);
  const firstName = pick(BANGLADESHI_FIRST_NAMES);
  const lastName = pick(BANGLADESHI_LAST_NAMES);
  const conditions = CONDITIONS_BY_SPECIALIZATION[doctor.specialization] ?? ["General checkup"];

  return {
    name: `${firstName} ${lastName}`,
    age: between(1, 92),
    gender: pick(["male", "female", "other"] as const),
    phone: `+880 1${between(3, 9)}${between(10000000, 99999999)}`,
    condition: pick(conditions),
    status: pick(STATUSES),
    admittedAt: new Date(now - Math.floor(random() * oneYear)),
    doctorId: doctor._id,
  };
});

  await PatientModel.insertMany(patients);

  console.log("Seed complete");
  console.log(`  users:    ${await UserModel.countDocuments()}`);
  console.log(`  doctors:  ${await DoctorModel.countDocuments()}`);
  console.log(`  patients: ${await PatientModel.countDocuments()}`);
  console.log(`\nAdmin login: ${ADMIN.email} / ${ADMIN.password}`);

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await disconnectDatabase();
  process.exit(1);
});
