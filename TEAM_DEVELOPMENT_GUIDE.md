# Team Development Guide - 5 Server Architecture

## 🏗️ Project Structure

```
drakz/
├── main-server.js          # Main orchestrator (combines all servers)
├── servers/                # Individual team member servers
│   ├── server1.js          # Authentication & User Management
│   ├── server2.js          # Products/Items Management
│   ├── server3.js          # Orders Management
│   ├── server4.js          # Reviews and Ratings
│   └── server5.js          # Analytics and Reports
├── utils/                  # Shared utilities
│   ├── database.js         # Database connection
│   ├── middleware.js       # Shared middleware
│   └── models.js           # Database models
├── src/                    # React frontend
└── package.json
```

## 🎯 Team Member Assignments

### Server 1 - Authentication & User Management (`/api/v1`)
**Team Member:** [ASSIGN YOUR NAME HERE]
- **File:** `servers/server1.js`
- **Routes:** All routes starting with `/api/v1`
- **Responsibilities:**
  - User registration & login
  - JWT authentication
  - User profile management
  - Password management
  - User administration (admin features)

### Server 2 - Products/Items Management (`/api/v2`)
**Team Member:** [ASSIGN YOUR NAME HERE]
- **File:** `servers/server2.js`
- **Routes:** All routes starting with `/api/v2`
- **Responsibilities:**
  - Product CRUD operations
  - Category management
  - Product search & filtering
  - Inventory management
  - Product statistics

### Server 3 - Orders Management (`/api/v3`)
**Team Member:** [ASSIGN YOUR NAME HERE]
- **File:** `servers/server3.js`
- **Routes:** All routes starting with `/api/v3`
- **Responsibilities:**
  - Order creation & management
  - Order status tracking
  - Order history
  - Payment integration (if needed)
  - Shipping management

### Server 4 - Reviews and Ratings (`/api/v4`)
**Team Member:** [ASSIGN YOUR NAME HERE]
- **File:** `servers/server4.js`
- **Routes:** All routes starting with `/api/v4`
- **Responsibilities:**
  - Review creation & management
  - Rating system
  - Review moderation
  - Rating analytics
  - Review statistics

### Server 5 - Analytics and Reports (`/api/v5`)
**Team Member:** [ASSIGN YOUR NAME HERE]
- **File:** `servers/server5.js`
- **Routes:** All routes starting with `/api/v5`
- **Responsibilities:**
  - Dashboard analytics
  - Sales reports
  - User analytics
  - System health monitoring
  - Data visualization APIs

## 🚀 How to Work on Your Server

### 1. **Claim Your Server**
1. Edit this file and add your name next to your assigned server
2. Open your assigned server file (e.g., `servers/server1.js`)
3. Replace `[YOUR NAME HERE]` with your actual name

### 2. **Development Workflow**
```bash
# 1. Install dependencies
npm install

# 2. Start development (runs all servers + frontend)
npm run dev

# 3. Or run just the backend servers
npm run server

# 4. Test your specific server
curl http://localhost:5000/api/v1/health  # Replace v1 with your version
```

### 3. **Adding New Routes**
In your assigned server file, add routes in the designated section:

```javascript
// ============================================================================
// ADD YOUR CUSTOM ROUTES BELOW THIS LINE
// ============================================================================

// Example: Add a new route
router.get('/your-route', authenticateToken, async (req, res) => {
    try {
        // Your code here
        res.json({ message: 'Your custom route works!' });
    } catch (error) {
        res.status(500).json({ message: 'Error message' });
    }
});
```

### 4. **Using Shared Resources**

#### Database Models
```javascript
// Import shared models
const { User, Item, Order, Review, Category } = require('../utils/models');

// Use them in your routes
const user = await User.findById(userId);
```

#### Middleware
```javascript
// Import shared middleware
const { authenticateToken, requireAdmin } = require('../utils/middleware');

// Use in your routes
router.get('/admin-route', authenticateToken, requireAdmin, async (req, res) => {
    // Admin-only route
});
```

## 🔧 API Endpoints by Server

### Server 1 - Authentication (`/api/v1`)
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password
- `GET /api/v1/users` - Get all users (admin)
- `PUT /api/v1/users/:id/toggle-status` - Toggle user status
- `GET /api/v1/users/stats` - User statistics

### Server 2 - Products (`/api/v2`)
- `GET /api/v2/items` - Get all items
- `GET /api/v2/items/:id` - Get single item
- `POST /api/v2/items` - Create item
- `PUT /api/v2/items/:id` - Update item
- `DELETE /api/v2/items/:id` - Delete item
- `GET /api/v2/categories` - Get categories
- `POST /api/v2/categories` - Create category

### Server 3 - Orders (`/api/v3`)
- `GET /api/v3/orders` - Get orders
- `POST /api/v3/orders` - Create order
- `PUT /api/v3/orders/:id/status` - Update order status

### Server 4 - Reviews (`/api/v4`)
- `GET /api/v4/reviews/item/:itemId` - Get item reviews
- `POST /api/v4/reviews` - Create review
- `PUT /api/v4/reviews/:id` - Update review
- `DELETE /api/v4/reviews/:id` - Delete review
- `GET /api/v4/reviews/user/my-reviews` - Get user reviews

### Server 5 - Analytics (`/api/v5`)
- `GET /api/v5/analytics/dashboard` - Dashboard overview
- `GET /api/v5/analytics/sales` - Sales analytics
- `GET /api/v5/analytics/users` - User analytics
- `GET /api/v5/reports/users` - Generate user report
- `GET /api/v5/reports/sales` - Generate sales report

## 🛠️ Development Best Practices

### 1. **Error Handling**
Always wrap your routes in try-catch blocks:
```javascript
router.get('/your-route', async (req, res) => {
    try {
        // Your code
        res.json({ success: true });
    } catch (error) {
        console.error('Error in your-route:', error);
        res.status(500).json({ message: 'Error description' });
    }
});
```

### 2. **Authentication**
Use the shared middleware for protected routes:
```javascript
// For logged-in users only
router.get('/protected-route', authenticateToken, async (req, res) => {
    // req.userId contains the authenticated user's ID
});

// For admin users only
router.get('/admin-route', authenticateToken, requireAdmin, async (req, res) => {
    // Admin-only route
});
```

### 3. **Validation**
Always validate input data:
```javascript
router.post('/create-item', authenticateToken, async (req, res) => {
    const { title, description, price } = req.body;
    
    if (!title || !description || !price) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Continue with creation...
});
```

### 4. **Testing Your Server**
```bash
# Test all servers
npm run test-servers

# Test your specific server
curl http://localhost:5000/api/v1/health  # Replace v1 with your version

# Check main server status
curl http://localhost:5000/api/health

# View API documentation
curl http://localhost:5000/api/docs
```

## 🔄 Git Workflow

### 1. **Branch Strategy**
```bash
# Create a branch for your server
git checkout -b server1-auth-features  # Replace with your server name

# Work on your changes
git add servers/server1.js
git commit -m "Add new authentication features"

# Push your branch
git push origin server1-auth-features
```

### 2. **Avoiding Conflicts**
- **Each team member works ONLY on their assigned server file**
- **DO NOT modify other servers' files**
- **Only modify shared files (utils/) if discussed with the team**
- **Test your changes before pushing**

### 3. **Merging Changes**
```bash
# Before merging, test all servers together
npm run dev

# Test the integration
npm run test-servers

# If everything works, merge your branch
```

## 🐛 Debugging

### Common Issues:

1. **"Cannot find module" errors**
   ```bash
   # Make sure you're in the project root
   npm install
   ```

2. **Database connection errors**
   ```bash
   # Check your .env file
   # Make sure MongoDB is running
   ```

3. **Port already in use**
   ```bash
   # Kill existing processes
   lsof -ti:5000 | xargs kill -9
   ```

4. **Routes not working**
   - Check if your route path is correct (`/api/v1`, `/api/v2`, etc.)
   - Make sure your server file exports the router: `module.exports = router;`
   - Check the main-server.js imports your server correctly

## 📞 Getting Help

1. **Check the main server logs** when running `npm run server`
2. **Use the health check endpoints** to test individual servers
3. **Check the API documentation** at `http://localhost:5000/api/docs`
4. **Ask team members** if you need help with shared utilities

## 🎉 Quick Start Checklist

- [ ] Claim your server by adding your name to this document
- [ ] Run `npm install` to install dependencies
- [ ] Update your `.env` file with your MongoDB URI
- [ ] Test the server with `npm run dev`
- [ ] Add your first custom route
- [ ] Test your specific server endpoint
- [ ] Commit your changes to your branch

## 🚦 Server Status URLs

Once the server is running (`npm run server`), you can check:

- **Main API Health:** http://localhost:5000/api/health
- **API Documentation:** http://localhost:5000/api/docs
- **Test All Servers:** http://localhost:5000/api/test-all
- **Server 1 Health:** http://localhost:5000/api/v1/health
- **Server 2 Health:** http://localhost:5000/api/v2/health
- **Server 3 Health:** http://localhost:5000/api/v3/health
- **Server 4 Health:** http://localhost:5000/api/v4/health
- **Server 5 Health:** http://localhost:5000/api/v5/health

---

**Happy Coding! 🚀**
