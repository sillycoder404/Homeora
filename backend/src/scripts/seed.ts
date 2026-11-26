import 'dotenv/config';
import { connectDatabase } from '../config/db';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Appointment } from '../models/Appointment';

async function seed() {
  await connectDatabase();
  await Promise.all([Appointment.deleteMany({}), Property.deleteMany({}), User.deleteMany({})]);

  const [admin, buyer, owner] = await User.create([
    { name: 'Homeora Admin', email: 'admin@homeora.in', phone: '9999999999', password: 'secret123', role: 'admin' },
    { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', password: 'secret123', role: 'user' },
    { name: 'Isha Patel', email: 'isha@example.com', phone: '9876501234', password: 'secret123', role: 'user' },
  ]);

  const photo = (id: string) => ({
    url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`,
    fileId: `seed-${id}`,
  });

  const properties = await Property.create([
    { title: 'Luxury 3BHK in South Delhi', description: 'Premium apartment near a green boulevard.', price: 27500000, type: 'apartment', listingType: 'sale', location: { city: 'Delhi', locality: 'Greater Kailash', address: 'Greater Kailash II, New Delhi' }, area: 1850, bedrooms: 3, bathrooms: 3, images: [photo('photo-1600585154340-be6161a56a0c')], owner: owner._id },
    { title: 'Sea-facing Apartment in Bandra', description: 'Modern apartment in a prime Mumbai neighbourhood.', price: 42000000, type: 'apartment', listingType: 'sale', location: { city: 'Mumbai', locality: 'Bandra West', address: 'Linking Road, Mumbai' }, area: 1450, bedrooms: 3, bathrooms: 3, images: [photo('photo-1600607687939-ce8a6c25118c')], owner: owner._id },
    { title: 'Modern 2BHK in Baner', description: 'Sunlit home close to schools and cafés.', price: 9500000, type: 'apartment', listingType: 'sale', location: { city: 'Pune', locality: 'Baner', address: 'Balewadi High Street, Pune' }, area: 1120, bedrooms: 2, bathrooms: 2, images: [photo('photo-1600566753086-00f18fb6b3ea')], owner: owner._id },
    { title: 'Royal Villa in Jaipur', description: 'Elegant villa inspired by Rajasthani architecture.', price: 22500000, type: 'villa', listingType: 'sale', location: { city: 'Jaipur', locality: 'C-Scheme', address: 'C-Scheme, Jaipur' }, area: 2400, bedrooms: 4, bathrooms: 4, images: [photo('photo-1600047509807-ba8f99d2cdde')], owner: owner._id },
    { title: 'River-view Apartment in Ahmedabad', description: 'Contemporary apartment in the heart of Gujarat.', price: 7800000, type: 'apartment', listingType: 'sale', location: { city: 'Ahmedabad', locality: 'Sabarmati', address: 'Riverfront Road, Ahmedabad' }, area: 1320, bedrooms: 2, bathrooms: 2, images: [photo('photo-1600573472550-8090b5e0745e')], owner: owner._id },
    { title: 'Garden Home in Lucknow', description: 'Spacious family home in Gomti Nagar.', price: 16800000, type: 'house', listingType: 'sale', location: { city: 'Lucknow', locality: 'Gomti Nagar', address: 'Vibhuti Khand, Lucknow' }, area: 1980, bedrooms: 3, bathrooms: 3, images: [photo('photo-1564013799919-ab600027ffc6')], owner: owner._id },
    { title: 'Canal City Apartment in Kanpur', description: 'Comfortable new apartment near the commercial district.', price: 6200000, type: 'apartment', listingType: 'sale', location: { city: 'Kanpur', locality: 'Civil Lines', address: 'Civil Lines, Kanpur' }, area: 1050, bedrooms: 2, bathrooms: 2, images: [photo('photo-1522708323590-d24dbb6b0267')], owner: owner._id },
    { title: 'Lake-view Heritage Villa in Udaipur', description: 'Private villa with lake and Aravalli views.', price: 36000000, type: 'villa', listingType: 'sale', location: { city: 'Udaipur', locality: 'Lake Pichola', address: 'Lake Pichola Road, Udaipur' }, area: 3200, bedrooms: 5, bathrooms: 5, images: [photo('photo-1600607687920-4e2a09cf159d')], owner: owner._id },
    { title: 'Himalayan Chalet in Manali', description: 'Warm mountain chalet with valley views.', price: 29000000, type: 'house', listingType: 'sale', location: { city: 'Manali', locality: 'Old Manali', address: 'Old Manali Road, Manali' }, area: 2200, bedrooms: 4, bathrooms: 3, images: [photo('photo-1600585154526-990dced4db0d')], owner: owner._id },
    { title: 'Apple Orchard Cottage in Shimla', description: 'Peaceful hillside cottage near Mall Road.', price: 24800000, type: 'house', listingType: 'sale', location: { city: 'Shimla', locality: 'Mall Road', address: 'Lower Mall Road, Shimla' }, area: 1750, bedrooms: 3, bathrooms: 3, images: [photo('photo-1510798831971-661eb04b3739')], owner: owner._id },
    { title: 'Luxury Houseboat in Srinagar', description: 'Traditional Kashmiri houseboat on Dal Lake.', price: 19500000, type: 'house', listingType: 'sale', location: { city: 'Srinagar', locality: 'Dal Lake', address: 'Dal Lake Boulevard, Srinagar' }, area: 1600, bedrooms: 3, bathrooms: 2, images: [photo('photo-1548013146-72479768bada')], owner: owner._id },
    { title: 'Modern Flat near Jammu Tawi', description: 'Connected city apartment with contemporary finishes.', price: 5850000, type: 'apartment', listingType: 'sale', location: { city: 'Jammu', locality: 'Tawi', address: 'Tawi Bridge Road, Jammu' }, area: 980, bedrooms: 2, bathrooms: 2, images: [photo('photo-1560448204-e02f11c3d0e2')], owner: owner._id },
    { title: 'Golf Course Villa in Gurugram', description: 'Large villa overlooking landscaped greens.', price: 48500000, type: 'villa', listingType: 'sale', location: { city: 'Gurugram', locality: 'Golf Course Road', address: 'Golf Course Road, Gurugram' }, area: 3600, bedrooms: 5, bathrooms: 5, images: [photo('photo-1600607688969-a5bfcd646154')], owner: owner._id },
    { title: 'IT Corridor Apartment in Bengaluru', description: 'Well-connected apartment in Whitefield.', price: 13800000, type: 'apartment', listingType: 'sale', location: { city: 'Bengaluru', locality: 'Whitefield', address: 'ITPL Main Road, Bengaluru' }, area: 1500, bedrooms: 3, bathrooms: 3, images: [photo('photo-1600210492486-724fe5c67fb0')], owner: owner._id },
    { title: 'Beachfront Villa in Goa', description: 'Private villa a short walk from the beach.', price: 32000000, type: 'villa', listingType: 'sale', location: { city: 'Goa', locality: 'Candolim', address: 'Candolim Beach Road, Goa' }, area: 2800, bedrooms: 4, bathrooms: 4, images: [photo('photo-1600596542815-ffad4c1539a9')], owner: owner._id },
    { title: 'Commercial Suite in Hyderabad', description: 'Premium office suite in the financial district.', price: 21000000, type: 'commercial', listingType: 'sale', location: { city: 'Hyderabad', locality: 'Gachibowli', address: 'Financial District, Hyderabad' }, area: 1800, bedrooms: 0, bathrooms: 2, images: [photo('photo-1497366754035-f200968a6e72')], owner: owner._id },
    { title: 'Hill-view Plot in Mussoorie', description: 'Large residential plot with Himalayan views.', price: 12400000, type: 'plot', listingType: 'sale', location: { city: 'Mussoorie', locality: 'Camel Back Road', address: 'Camel Back Road, Mussoorie' }, area: 2600, bedrooms: 0, bathrooms: 0, images: [photo('photo-1500530855697-b586d89ba3ee')], owner: owner._id },
    { title: 'Studio in Chennai Marina', description: 'Compact furnished studio near the coast.', price: 7200000, type: 'apartment', listingType: 'sale', location: { city: 'Chennai', locality: 'Marina', address: 'Kamaraj Salai, Chennai' }, area: 620, bedrooms: 1, bathrooms: 1, images: [photo('photo-1502672260266-1c1ef2d93688')], owner: owner._id },
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
