import { Schema, model, models, Types } from "mongoose";

export type ReportStatus = "pending" | "proses" | "selesai";

export interface IReport {
  userId: Types.ObjectId;
  category: string;
  location: string;
  description: string;
  photoUrl?: string;
  status: ReportStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "proses", "selesai"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report =
  models.Report || model<IReport>("Report", ReportSchema);
