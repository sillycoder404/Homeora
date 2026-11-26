import { Response, NextFunction } from 'express';
import type { QueryFilter } from 'mongoose';
import { body, validationResult } from 'express-validator';
import { Property, IProperty } from '../models/Property';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { getImageKit } from '../utils/imagekit';

export const propertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('type').isIn(['apartment', 'house', 'villa', 'plot', 'commercial']).withMessage('Invalid property type'),
  body('area').isFloat({ min: 0 }).withMessage('Area must be positive'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be zero or more'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be zero or more'),
];

function validateRequest(req: AuthRequest): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

function parsePropertyBody(body: Record<string, unknown>): Record<string, unknown> {
  const parsed = { ...body };
  for (const key of ['location']) {
    if (typeof parsed[key] === 'string') {
      try {
        parsed[key] = JSON.parse(parsed[key] as string);
      } catch {
        throw new ApiError(400, 'Location must include city, locality and address');
      }
    }
  }
  for (const key of ['price', 'area', 'bedrooms', 'bathrooms']) {
    if (typeof parsed[key] === 'string') parsed[key] = Number(parsed[key]);
  }
  return parsed;
}

async function uploadImages(files: Express.Multer.File[] = []): Promise<Array<{ url: string; fileId: string }>> {
  const imagekit = getImageKit();
  const uploads = await Promise.all(
    files.map((file) =>
      imagekit.upload({
        file: file.buffer,
        fileName: `property-${Date.now()}-${file.originalname}`,
        folder: '/realestate/properties',
      }),
    ),
  );
  return uploads.map((upload) => ({ url: upload.url, fileId: upload.fileId }));
}

export async function getProperties(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      minPrice, maxPrice, type, location, minArea, maxArea, bedrooms,
      page = '1', limit = '12', sort = '-createdAt',
    } = req.query;

    const filter: Record<string, unknown> = { listingType: 'sale' };
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length) filter.price = priceFilter;
    if (type) filter.type = String(type);
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    const areaFilter: Record<string, number> = {};
    if (minArea) areaFilter.$gte = Number(minArea);
    if (maxArea) areaFilter.$lte = Number(maxArea);
    if (Object.keys(areaFilter).length) filter.area = areaFilter;
    if (location) {
      const regex = new RegExp(String(location), 'i');
      filter.$or = [{ 'location.city': regex }, { 'location.locality': regex }];
    }

    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.min(50, Math.max(1, Number(limit)));
    const [properties, total] = await Promise.all([
      Property.find(filter as unknown as QueryFilter<IProperty>).populate('owner', 'name email phone').sort(String(sort))
        .skip((pageNumber - 1) * pageSize).limit(pageSize),
      Property.countDocuments(filter as unknown as QueryFilter<IProperty>),
    ]);

    res.json({
      success: true,
      message: 'Properties fetched',
      data: { properties, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProperty(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone');
    if (!property) throw new ApiError(404, 'Property not found');
    res.json({ success: true, message: 'Property fetched', data: property });
  } catch (error) {
    next(error);
  }
}

export async function createProperty(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const data = parsePropertyBody(req.body);
    const location = data.location as { city?: string; locality?: string; address?: string } | undefined;
    if (!location?.city || !location.locality || !location.address) {
      throw new ApiError(400, 'City, locality and address are required');
    }
    const images = await uploadImages(req.files as Express.Multer.File[]);
    const property = await Property.create({ ...data, images, owner: req.user!._id });
    res.status(201).json({ success: true, message: 'Property created', data: property });
  } catch (error) {
    next(error);
  }
}

export async function updateProperty(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    validateRequest(req);
    const property = await Property.findById(req.params.id);
    if (!property) throw new ApiError(404, 'Property not found');
    if (property.owner.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only edit your own property');
    }

    const data = parsePropertyBody(req.body);
    const location = data.location as { city?: string; locality?: string; address?: string } | undefined;
    if (!location?.city || !location.locality || !location.address) {
      throw new ApiError(400, 'City, locality and address are required');
    }
    const uploaded = await uploadImages(req.files as Express.Multer.File[]);
    if (uploaded.length) {
      if (property.images.length + uploaded.length > 4) throw new ApiError(400, 'A property can have at most 4 images');
      property.images.push(...uploaded);
    }

    Object.assign(property, data);
    await property.save();
    res.json({ success: true, message: 'Property updated', data: property });
  } catch (error) {
    next(error);
  }
}

export async function deleteProperty(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new ApiError(404, 'Property not found');
    if (property.owner.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only delete your own property');
    }

    const imagekit = getImageKit();
    await Promise.all(property.images.map((image) => imagekit.deleteFile(image.fileId)));
    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted', data: null });
  } catch (error) {
    next(error);
  }
}

export async function getMyProperties(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const properties = await Property.find({ owner: req.user!._id }).sort('-createdAt');
    res.json({ success: true, message: 'My properties', data: properties });
  } catch (error) {
    next(error);
  }
}
