import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/FDFED";

const propertyData = [
  { name: 'Luxury Villa Gachibowli', type: 'residential', value: 8500000, location: 'Gachibowli, Hyderabad' },
  { name: 'Office Space IT Park', type: 'commercial', value: 12000000, location: 'HITEC City, Hyderabad' },
  { name: '3BHK Apartment', type: 'residential', value: 4500000, location: 'Kondapur, Hyderabad' },
  { name: 'Retail Shop', type: 'commercial', value: 3200000, location: 'Ameerpet, Hyderabad' },
  { name: '2BHK Flat', type: 'residential', value: 3500000, location: 'Madhapur, Hyderabad' },
  { name: 'Warehouse', type: 'commercial', value: 6500000, location: 'Shamshabad, Hyderabad' },
  { name: 'Independent House', type: 'residential', value: 7200000, location: 'Jubilee Hills, Hyderabad' },
  { name: 'Co-working Space', type: 'commercial', value: 5800000, location: 'Banjara Hills, Hyderabad' }
];

function generateRandomProperties(peopleIds) {
  const properties = [];
  
  peopleIds.forEach((peopleId, index) => {
    // Each person has 1-3 properties
    const numProperties = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numProperties; i++) {
      const property = propertyData[Math.floor(Math.random() * propertyData.length)];
      
      properties.push({
        people_id: peopleId,
        property_name: `${property.name} ${index + 1}-${i + 1}`,
        type: property.type,
        value: property.value + (Math.random() * 1000000 - 500000), // ±5L variation
        location: property.location,
        image_url: `https://example.com/property-image-${Math.floor(Math.random() * 100)}.jpg`
      });
    }
  });
  
  return properties;
}

async function insertProperties() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('fdfed');
    
    // Get all people IDs
    const peopleCollection = db.collection('people');
    const people = await peopleCollection.find({}).toArray();
    const peopleIds = people.map(person => person._id);
    
    // Generate property data
    const propertiesData = generateRandomProperties(peopleIds);
    
    const collection = db.collection('properties');
    const result = await collection.insertMany(propertiesData);
    console.log(`${result.insertedCount} property records inserted successfully`);
    
  } catch (error) {
    console.error('Error inserting properties:', error);
  } finally {
    await client.close();
  }
}

insertProperties();