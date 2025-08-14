# Drakz Backend API Documentation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/drakz
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your machine.

4. **Run the Server**
   ```bash
   # Backend only
   npm run server
   
   # Both frontend and backend
   npm run dev
   ```

## API Endpoints

### Authentication Routes

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "username": "newusername"
  }
  ```

#### Change Password
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```

### Items/Products Routes

#### Get All Items
- **GET** `/api/items`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `category` (filter by category)
  - `search` (search in title/description)

#### Get Single Item
- **GET** `/api/items/:id`

#### Create Item
- **POST** `/api/items`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Product Title",
    "description": "Product description",
    "price": 99.99,
    "category": "electronics",
    "imageUrl": "https://example.com/image.jpg"
  }
  ```

#### Update Item
- **PUT** `/api/items/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** (any fields to update)

#### Delete Item
- **DELETE** `/api/items/:id`
- **Headers:** `Authorization: Bearer <token>`

### Admin Routes

#### Get All Users (Admin Only)
- **GET** `/api/admin/users`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)

#### Toggle User Status (Admin Only)
- **PUT** `/api/admin/users/:id/toggle-status`
- **Headers:** `Authorization: Bearer <admin_token>`

#### Get Dashboard Stats (Admin Only)
- **GET** `/api/admin/stats`
- **Headers:** `Authorization: Bearer <admin_token>`

### General Routes

#### Health Check
- **GET** `/api/health`

#### Get Categories
- **GET** `/api/categories`

## Database Models

### User Model
```javascript
{
  username: String (unique, required, 3-30 chars),
  email: String (unique, required, valid email),
  password: String (required, min 6 chars, hashed),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: 'user', 'admin', default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  timestamps: true
}
```

### Item Model
```javascript
{
  title: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum: ['electronics', 'clothing', 'books', 'sports', 'other']),
  imageUrl: String (optional),
  inStock: Boolean (default: true),
  createdBy: ObjectId (ref: 'User', required),
  timestamps: true
}
```

## Error Responses

All errors return JSON in this format:
```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 7 days.

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

## CORS

The server accepts requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

Add your production domain to the CORS configuration before deploying.
