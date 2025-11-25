# My Privilege Dashboard - API Guide

## Overview
Complete functional API endpoints for the My Privilege Dashboard feature with random user data generation.

## Base URL
```
http://localhost:3002/api/privilege
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Get User Profile
**GET** `/profile`

Fetches the authenticated user's profile information.

**Response:**
```json
{
  "_id": "userId",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Insurances

#### Get All Insurances
**GET** `/insurances`

Fetches all insurance policies for the authenticated user.

**Response:**
```json
[
  {
    "_id": "insuranceId",
    "userId": "userId",
    "provider": "Geico",
    "type": "Auto",
    "coverageAmount": 250000,
    "premium": 350,
    "startDate": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Generate Random Insurances
**POST** `/seed`

Generates 2 random insurance policies (deletes existing insurances).

**Response:**
```json
{
  "msg": "Insurances updated!",
  "insurances": [...],
  "properties": [...],
  "holdings": [...],
  "transactions": [...]
}
```

---

### 3. Properties

#### Get All Properties
**GET** `/properties`

Fetches all properties owned by the authenticated user.

**Response:**
```json
[
  {
    "_id": "propertyId",
    "userId": "userId",
    "name": "Sunset Villa",
    "value": 850000,
    "location": "California",
    "imageUrl": "/property1.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Add New Property
**POST** `/properties`

Adds a new property to the user's portfolio.

**Request Body:**
```json
{
  "name": "Ocean View Apartment",
  "value": 650000,
  "location": "Florida",
  "imageUrl": "/property2.jpg"
}
```

**Response:**
```json
{
  "_id": "propertyId",
  "userId": "userId",
  "name": "Ocean View Apartment",
  "value": 650000,
  "location": "Florida",
  "imageUrl": "/property2.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Delete Property
**DELETE** `/properties/:id`

Deletes a specific property.

**Response:**
```json
{
  "msg": "Property removed"
}
```

---

### 4. Precious Holdings

#### Get All Holdings
**GET** `/precious_holdings`

Fetches all precious metal holdings.

**Response:**
```json
[
  {
    "_id": "holdingId",
    "userId": "userId",
    "name": "Gold Coins",
    "type": "Gold",
    "weight": "50g",
    "purchasedValue": 25000,
    "currentValue": 28000,
    "purchaseDate": "2023-06-15T00:00:00.000Z"
  }
]
```

#### Add New Holding
**POST** `/precious_holdings`

Adds a new precious holding.

**Request Body:**
```json
{
  "name": "Silver Bars",
  "type": "Silver",
  "weight": "100g",
  "purchasedValue": 15000,
  "currentValue": 16500,
  "purchaseDate": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "_id": "holdingId",
  "userId": "userId",
  "name": "Silver Bars",
  "type": "Silver",
  "weight": "100g",
  "purchasedValue": 15000,
  "currentValue": 16500,
  "purchaseDate": "2024-01-01T00:00:00.000Z"
}
```

#### Delete Holding
**DELETE** `/precious_holdings/:id`

Deletes a specific holding.

**Response:**
```json
{
  "msg": "Holding removed successfully"
}
```

---

### 5. Transactions

#### Get Recent Transactions
**GET** `/transactions?limit=5`

Fetches recent transactions (default limit: 5).

**Query Parameters:**
- `limit` (optional): Number of transactions to fetch

**Response:**
```json
[
  {
    "_id": "transactionId",
    "userId": "userId",
    "type": "Income",
    "amount": 5000,
    "status": "Completed",
    "description": "Salary",
    "date": "2024-11-20T00:00:00.000Z"
  }
]
```

---

### 6. Generate Complete Random Data
**POST** `/seed-all`

Generates complete random data for the user:
- 2-4 random insurances
- 2-3 random properties
- 1-3 random precious holdings
- 5-8 random transactions

**Response:**
```json
{
  "msg": "Complete data generated successfully!",
  "data": {
    "insurances": [...],
    "properties": [...],
    "holdings": [...],
    "transactions": [...]
  }
}
```

**Generated Data Types:**

**Insurances:**
- Types: Auto, Health, Life, Home
- Providers: Geico, BlueCross, StateFarm, Allstate, Progressive, Aetna
- Coverage: $50,000 - $550,000
- Premium: $100 - $600

**Properties:**
- Names: Sunset Villa, Ocean View Apartment, Downtown Condo, Mountain Retreat, Urban Loft
- Locations: California, New York, Florida, Texas, Colorado
- Values: $200,000 - $1,200,000

**Holdings:**
- Types: Gold, Silver, Platinum
- Names: Gold Coins, Silver Bars, Platinum Ingots, Gold Jewelry, Silver Coins
- Weight: 10g - 110g
- Values: $10,000 - $60,000

**Transactions:**
- Types: Expense, Investment, Loan, Insurance, Income
- Amounts: $100 - $5,100
- Descriptions: Varied by type (Salary, Grocery, Stock Purchase, etc.)
- Dates: Last 30 days

---

## Error Responses

All endpoints return appropriate HTTP status codes:

**400 Bad Request:**
```json
{
  "error": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "msg": "No token, authorization denied"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error message"
}
```

---

## Frontend Integration

### Example Usage in MyPrivilege Component:

```javascript
// Fetch all data
const fetchData = async () => {
  const [profileRes, insurancesRes, propertiesRes, holdingsRes, transactionsRes] = 
    await Promise.all([
      api.get("/api/privilege/profile"),
      api.get("/api/privilege/insurances"),
      api.get("/api/privilege/properties"),
      api.get("/api/privilege/precious_holdings"),
      api.get("/api/privilege/transactions?limit=5")
    ]);
};

// Generate random insurances only
const handleSeedData = async () => {
  await api.post('/api/privilege/seed');
  await fetchData();
};

// Generate all random data
const handleSeedAllData = async () => {
  await api.post('/api/privilege/seed-all');
  await fetchData();
};

// Add property
const handleAddProperty = async (data) => {
  await api.post('/api/privilege/properties', data);
  await fetchData();
};

// Delete property
const handleRemoveProperty = async (id) => {
  await api.delete(`/api/privilege/properties/${id}`);
  await fetchData();
};

// Add holding
const handleAddHolding = async (data) => {
  await api.post('/api/privilege/precious_holdings', data);
  await fetchData();
};

// Delete holding
const handleRemoveHolding = async (id) => {
  await api.delete(`/api/privilege/precious_holdings/${id}`);
  await fetchData();
};
```

---

## Features Implemented

✅ **User Profile** - Fetch real user data from authentication
✅ **Insurance Management** - View and generate random insurances
✅ **Property Management** - Add, view, and delete properties
✅ **Holdings Management** - Add, view, and delete precious metal holdings
✅ **Transaction History** - View recent transactions
✅ **Random Data Generation** - Generate sample data for testing/demo
✅ **Complete CRUD Operations** - Full create, read, update, delete functionality
✅ **Error Handling** - Comprehensive error messages
✅ **Loading States** - Proper loading indicators
✅ **Responsive Design** - Mobile-friendly UI

---

## Testing the API

### Using cURL:

```bash
# Get user profile
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/api/privilege/profile

# Generate all data
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/api/privilege/seed-all

# Add property
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Property","value":500000,"location":"New York","imageUrl":"/1.jpg"}' \
  http://localhost:3002/api/privilege/properties

# Delete holding
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3002/api/privilege/precious_holdings/HOLDING_ID
```

---

## Notes

- All data is user-specific (filtered by `userId` from JWT token)
- Seed endpoints delete existing data before generating new data
- Date ranges for generated data vary to simulate realistic activity
- Property images use placeholder paths (ensure images exist in public folder)
- Transaction types determine icon colors and descriptions in UI
