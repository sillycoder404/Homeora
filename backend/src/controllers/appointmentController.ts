import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Appointment } from '../models/Appointment';
import { Property } from '../models/Property';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

export const guestAppointmentValidation = [
  body('property').notEmpty().withMessage('Property is required'),
  body('guestName').trim().notEmpty().withMessage('Guest name is required'),
  body('guestEmail').isEmail().withMessage('Valid guest email is required'),
  body('guestPhone').trim().isLength({ min: 10 }).withMessage('Valid guest phone is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
];

export const userAppointmentValidation = [
  body('property').notEmpty().withMessage('Property is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').trim().notEmpty().withMessage('Time is required'),
];

function validate(req: AuthRequest): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

async function createAppointment(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  guest: boolean,
): Promise<void> {
  try {
    validate(req);
    const property = await Property.findById(req.body.property);
    if (!property) throw new ApiError(404, 'Property not found');

    const date = new Date(req.body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) throw new ApiError(400, 'Viewing date cannot be in the past');

    const duplicate = await Appointment.findOne({
      property: req.body.property,
      date,
      time: req.body.time,
      status: { $ne: 'cancelled' },
    });
    if (duplicate) throw new ApiError(409, 'This viewing slot is already booked');

    const data = guest
      ? {
          property: req.body.property,
          guestName: req.body.guestName,
          guestEmail: req.body.guestEmail,
          guestPhone: req.body.guestPhone,
          date,
          time: req.body.time,
          message: req.body.message,
        }
      : {
          property: req.body.property,
          user: req.user!._id,
          date,
          time: req.body.time,
          message: req.body.message,
        };

    const appointment = await Appointment.create(data);
    res.status(201).json({ success: true, message: 'Viewing booked successfully', data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function createGuestAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  await createAppointment(req, res, next, true);
}

export async function createUserAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  await createAppointment(req, res, next, false);
}

export async function getMyAppointments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const appointments = await Appointment.find({ user: req.user!._id })
      .populate('property', 'title price location images')
      .sort('-date');
    res.json({ success: true, message: 'My appointments', data: appointments });
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, 'Appointment not found');
    if (!appointment.user || appointment.user.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only cancel your own appointments');
    }
    if (appointment.status === 'cancelled') throw new ApiError(400, 'Appointment is already cancelled');

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    next(error);
  }
}
