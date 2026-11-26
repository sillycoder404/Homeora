import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  type: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
  listingType: 'sale';
  location: { city: string; locality: string; address: string };
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: Array<{ url: string; fileId: string }>;
  owner: mongoose.Types.ObjectId;
}

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ['apartment', 'house', 'villa', 'plot', 'commercial'] },
    listingType: { type: String, required: true, enum: ['sale'], default: 'sale' },
    location: {
      city: { type: String, required: true, trim: true },
      locality: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    area: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    images: {
      type: [{ url: { type: String, required: true }, fileId: { type: String, required: true } }],
      validate: [(value: unknown[]) => value.length <= 4, 'A property can have at most 4 images'],
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Property: Model<IProperty> = mongoose.model<IProperty>('Property', propertySchema);
