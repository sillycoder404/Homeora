import 'dotenv/config';
import { connectDatabase } from '../config/db';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Appointment } from '../models/Appointment';

async function seed() {
  await connectDatabase();
  await Promise.all([Appointment.deleteMany({}), Property.deleteMany({}), User.deleteMany({})]);

  const [buyer, owner] = await User.create([
    { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', password: 'secret123' },
    { name: 'Isha Patel', email: 'isha@example.com', phone: '9876501234', password: 'secret123' },
  ]);

  const properties = await Property.create([
    {
      title: '2BHK Apartment in Baner',
      description: 'Sunlit apartment near Balewadi High Street.',
      price: 9500000,
      type: 'apartment',
      listingType: 'sale',
      location: { city: 'Pune', locality: 'Baner', address: 'Balewadi High Street, Pune' },
      area: 1120,
      bedrooms: 2,
      bathrooms: 2,
      images: [],
      owner: owner._id,
    },
    {
      title: 'Independent Villa in Whitefield',
      description: 'Premium villa close to technology parks.',
      price: 18500000,
      type: 'villa',
      listingType: 'sale',
      location: { city: 'Bengaluru', locality: 'Whitefield', address: 'Varthur Road, Bengaluru' },
      area: 2100,
      bedrooms: 4,
      bathrooms: 4,
      images: [],
      owner: owner._id,
    },
  ]);

  await Appointment.create({
    property: properties[0]._id,
    user: buyer._id,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '10:00 AM',
    message: 'Interested in a weekend viewing.',
  });

  console.log('Seeded users, properties and one appointment');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
