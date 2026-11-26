import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppointment extends Document {
  property: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  date: Date;
  time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const appointmentSchema = new Schema<IAppointment>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, trim: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    guestPhone: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true },
);

appointmentSchema.index({ property: 1, date: 1, time: 1 });

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>('Appointment', appointmentSchema);
