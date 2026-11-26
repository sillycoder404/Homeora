import 'dotenv/config';
import { connectDatabase } from '../config/db';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Appointment } from '../models/Appointment';

async function seed() {
  await connectDatabase();
  const findOrCreateUser = async (details: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
  }) => {
    let user = await User.findOne({ email: details.email });
    if (!user) user = await User.create(details);
    if (user.role !== details.role) {
      user.role = details.role;
      await user.save();
    }
    return user;
  };

  await findOrCreateUser({
    name: 'Homeora Admin',
    email: 'admin@homeora.in',
    phone: '9999999999',
    password: 'secret123',
    role: 'admin',
  });
  const buyer = await findOrCreateUser({
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '9876543210',
    password: 'secret123',
    role: 'user',
  });
  const owner = await findOrCreateUser({
    name: 'Isha Patel',
    email: 'isha@example.com',
    phone: '9876501234',
    password: 'secret123',
    role: 'user',
  });

  const cities = [
    { city: 'Delhi', localities: ['Greater Kailash', 'Lajpat Nagar', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Saket', 'Karol Bagh', 'Mayur Vihar'], base: 12000000 },
    { city: 'Mumbai', localities: ['Bandra West', 'Andheri West', 'Powai', 'Thane West', 'Worli', 'Borivali', 'Chembur', 'Goregaon'], base: 18000000 },
    { city: 'Pune', localities: ['Baner', 'Hinjewadi', 'Kharadi', 'Wakad', 'Kothrud', 'Viman Nagar', 'Hadapsar', 'Aundh'], base: 6500000 },
    { city: 'Jaipur', localities: ['C-Scheme', 'Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Jagatpura', 'Tonk Road', 'Ajmer Road', 'Bani Park'], base: 7000000 },
    { city: 'Ahmedabad', localities: ['Sabarmati', 'Satellite', 'Prahlad Nagar', 'Bopal', 'Thaltej', 'Gota', 'Maninagar', 'Chandkheda'], base: 5500000 },
    { city: 'Lucknow', localities: ['Gomti Nagar', 'Indira Nagar', 'Aliganj', 'Hazratganj', 'Jankipuram', 'Sushant Golf City', 'Mahanagar', 'Vikas Nagar'], base: 6500000 },
    { city: 'Kanpur', localities: ['Civil Lines', 'Kakadeo', 'Swaroop Nagar', 'Kalyanpur', 'Kidwai Nagar', 'Shyam Nagar', 'Panki', 'Barra'], base: 4200000 },
    { city: 'Udaipur', localities: ['Lake Pichola', 'Fatehpura', 'Hiran Magri', 'Shobhagpura', 'Bhopalpura', 'Ashok Nagar', 'Pratap Nagar', 'Ambamata'], base: 9500000 },
    { city: 'Manali', localities: ['Old Manali', 'Aleo', 'Vashisht', 'Prini', 'Naggar Road', 'Simsa', 'Dhungri', 'Burua'], base: 9000000 },
    { city: 'Shimla', localities: ['Mall Road', 'New Shimla', 'Sanjauli', 'Chotta Shimla', 'Summer Hill', 'Mashobra', 'Kufri Road', 'Tutikandi'], base: 10000000 },
    { city: 'Srinagar', localities: ['Dal Lake', 'Raj Bagh', 'Jawahar Nagar', 'Hyderpora', 'Nishat', 'Hazratbal', 'Sonwar Bagh', 'Bemina'], base: 8500000 },
    { city: 'Jammu', localities: ['Tawi', 'Gandhi Nagar', 'Trikuta Nagar', 'Channi Himmat', 'Sainik Colony', 'Janipur', 'Bohri', 'Bhatindi'], base: 4500000 },
    { city: 'Gurugram', localities: ['Golf Course Road', 'Sohna Road', 'Sector 57', 'DLF Phase 3', 'Sector 67', 'Palam Vihar', 'Sector 49', 'New Gurgaon'], base: 16000000 },
    { city: 'Bengaluru', localities: ['Whitefield', 'Sarjapur Road', 'Indiranagar', 'Electronic City', 'Hebbal', 'HSR Layout', 'Yelahanka', 'Jayanagar'], base: 9000000 },
    { city: 'Goa', localities: ['Candolim', 'Anjuna', 'Panaji', 'Calangute', 'Mapusa', 'Margao', 'Porvorim', 'Vasco da Gama'], base: 10000000 },
    { city: 'Hyderabad', localities: ['Gachibowli', 'Madhapur', 'Kondapur', 'Kukatpally', 'Kokapet', 'Banjara Hills', 'Manikonda', 'Miyapur'], base: 7000000 },
    { city: 'Mussoorie', localities: ['Camel Back Road', 'Landour', 'Library Bazaar', 'Kulri', 'Bhatta Falls', 'Company Garden', 'Picture Palace', 'Happy Valley'], base: 10000000 },
    { city: 'Chennai', localities: ['Marina', 'Adyar', 'Velachery', 'OMR', 'Anna Nagar', 'Tambaram', 'Porur', 'ECR'], base: 6500000 },
    { city: 'Kolkata', localities: ['Salt Lake', 'New Town', 'Park Street', 'Ballygunge', 'Alipore', 'Rajarhat', 'Tollygunge', 'Howrah'], base: 6000000 },
    { city: 'Indore', localities: ['Vijay Nagar', 'Palasia', 'Scheme 140', 'Rau', 'AB Road', 'Super Corridor', 'Bhawarkua', 'Mahalaxmi Nagar'], base: 5000000 },
    { city: 'Bhopal', localities: ['Arera Colony', 'Kolar Road', 'MP Nagar', 'Shahpura', 'Hoshangabad Road', 'Ayodhya Bypass', 'Bawadia Kalan', 'Berasia Road'], base: 4500000 },
    { city: 'Nagpur', localities: ['Dharampeth', 'Manish Nagar', 'Wardha Road', 'Civil Lines', 'Besa', 'Hingna Road', 'Sadar', 'Mihan'], base: 4500000 },
    { city: 'Kochi', localities: ['Marine Drive', 'Kakkanad', 'Edappally', 'Panampilly Nagar', 'Fort Kochi', 'Vyttila', 'Aluva', 'Thrippunithura'], base: 6500000 },
    { city: 'Coimbatore', localities: ['RS Puram', 'Race Course', 'Saravanampatti', 'Peelamedu', 'Saibaba Colony', 'Vadavalli', 'Kalapatti', 'Avinashi Road'], base: 5000000 },
    { city: 'Chandigarh', localities: ['Sector 8', 'Sector 17', 'Sector 35', 'Sector 44', 'Manimajra', 'Sector 20', 'Sector 46', 'Sector 43'], base: 9500000 },
    { city: 'Dehradun', localities: ['Rajpur Road', 'Clement Town', 'Sahastradhara Road', 'Race Course', 'Prem Nagar', 'Vasant Vihar', 'Jakhan', 'Dalanwala'], base: 6500000 },
    { city: 'Rishikesh', localities: ['Tapovan', 'Laxman Jhula', 'Muni Ki Reti', 'Virbhadra', 'Bharat Mandir', 'Shyampur', 'Avas Vikas', 'Pashulok'], base: 5500000 },
    { city: 'Varanasi', localities: ['Assi Ghat', 'Lanka', 'Sigra', 'Bhelupur', 'Mahmoorganj', 'Shivpur', 'Sarnath', 'Ramnagar'], base: 5000000 },
    { city: 'Agra', localities: ['Tajganj', 'Sikandra', 'Dayalbagh', 'Kamla Nagar', 'Fatehabad Road', 'Shastripuram', 'Civil Lines', 'Bodla'], base: 4800000 },
    { city: 'Amritsar', localities: ['Ranjit Avenue', 'Lawrence Road', 'Green Avenue', 'Majitha Road', 'Mall Road', 'GT Road', 'Airport Road', 'Chheharta'], base: 5000000 },
    { city: 'Jodhpur', localities: ['Paota', 'Ratanada', 'Sardarpura', 'Shastri Nagar', 'Chopasni Road', 'Mandore', 'Pal Road', 'Basni'], base: 5500000 },
    { city: 'Surat', localities: ['Vesu', 'Adajan', 'Piplod', 'Pal', 'Dumas Road', 'Athwa', 'Althan', 'Varachha'], base: 6000000 },
    { city: 'Vadodara', localities: ['Alkapuri', 'Gotri', 'Vasna Road', 'Bhayli', 'Manjalpur', 'Fatehgunj', 'Akota', 'Sama'], base: 5200000 },
    { city: 'Nashik', localities: ['Gangapur Road', 'Indira Nagar', 'College Road', 'Pathardi Phata', 'Panchavati', 'Govind Nagar', 'Makhmalabad', 'Satpur'], base: 4800000 },
    { city: 'Noida', localities: ['Sector 50', 'Sector 62', 'Sector 75', 'Sector 137', 'Sector 150', 'Sector 78', 'Sector 93', 'Greater Noida West'], base: 8500000 },
  ];

  const photoIds = [
    'photo-1600585154340-be6161a56a0c',
    'photo-1600607687939-ce8a6c25118c',
    'photo-1600566753086-00f18fb6b3ea',
    'photo-1600047509807-ba8f99d2cdde',
    'photo-1600573472550-8090b5e0745e',
    'photo-1564013799919-ab600027ffc6',
    'photo-1600607687920-4e2a09cf159d',
    'photo-1600585154526-990dced4db0d',
    'photo-1510798831971-661eb04b3739',
    'photo-1560448204-e02f11c3d0e2',
    'photo-1522708323590-d24dbb6b0267',
    'photo-1600210492486-724fe5c67fb0',
    'photo-1600596542815-ffad4c1539a9',
    'photo-1600607688969-a5bfcd646154',
    'photo-1502672260266-1c1ef2d93688',
    'photo-1497366754035-f200968a6e72',
  ];
  const types = ['apartment', 'apartment', 'house', 'villa', 'apartment', 'house', 'plot', 'apartment'] as const;
  const propertyWrites = cities.flatMap(({ city, localities, base }, cityIndex) =>
    localities.map((locality, index) => {
      const type = types[index];
      const bedrooms = [2, 3, 3, 4, 2, 3, 0, 1][index];
      const bathrooms = bedrooms === 0 ? 0 : Math.min(5, Math.max(1, bedrooms));
      const price = base + (index * 725000) + (cityIndex * 17000);
      const title = `${bedrooms || 'Residential'}${bedrooms ? 'BHK' : ''} ${type} in ${locality}`;
      const photoId = photoIds[(cityIndex * 3 + index * 5) % photoIds.length];
      const property = {
        title,
        description: `Bright ${type} for sale in ${locality}, ${city}. Conveniently located near local transport, markets and everyday amenities.`,
        price,
        type,
        listingType: 'sale',
        location: { city, locality, address: `${locality}, ${city}` },
        area: bedrooms === 0 ? 1800 + index * 120 : 650 + bedrooms * 260 + index * 55,
        bedrooms,
        bathrooms,
        images: [{
          url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=82`,
          fileId: `seed-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
        }],
        owner: owner._id,
      };

      return {
        updateOne: {
          filter: { title, 'location.city': city, 'location.locality': locality, owner: owner._id },
          update: { $setOnInsert: property },
          upsert: true,
        },
      };
    }),
  );
  const seedResult = await Property.bulkWrite(propertyWrites, { ordered: false });

  const appointmentProperty = await Property.findOne({ 'location.city': 'Delhi', owner: owner._id });
  if (appointmentProperty && !(await Appointment.exists({ property: appointmentProperty._id, user: buyer._id }))) {
    await Appointment.create({
      property: appointmentProperty._id,
      user: buyer._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      message: 'Interested in a weekend viewing.',
    });
  }

  console.log(`Seed complete: ${seedResult.upsertedCount} new properties across ${cities.length} cities; existing accounts and listings were preserved.`);
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
