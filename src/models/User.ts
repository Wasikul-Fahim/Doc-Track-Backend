import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    // select: false => the hash never leaves the database unless explicitly asked for.
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "admin",
      required: true,
    },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model("User", userSchema);
