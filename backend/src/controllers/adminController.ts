import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

export async function getAdminOverview(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [users, properties, appointments, [pendingAppointments, confirmedAppointments, cancelledAppointments]] =
      await Promise.all([
        User.find().select('-password').sort('-createdAt'),
        Property.find().populate('owner', 'name email role').sort('-createdAt'),
        Appointment.find().populate('property', 'title location').populate('user', 'name email').sort('-createdAt'),
        Promise.all([
          Appointment.countDocuments({ status: 'pending' }),
          Appointment.countDocuments({ status: 'confirmed' }),
          Appointment.countDocuments({ status: 'cancelled' }),
        ]),
      ]);

    res.json({
      success: true,
      message: 'Admin overview',
      data: {
        users,
        properties,
        appointments,
        stats: {
          users: users.length,
          properties: properties.length,
          appointments: appointments.length,
          pendingAppointments,
          confirmedAppointments,
          cancelledAppointments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
