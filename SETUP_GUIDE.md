# DRAKZ-1 Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Krishna-ctrl1/DRAKZ-1.git
cd DRAKZ-1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as template):

```env
MONGO_URI=mongodb://localhost:27017/drakz-db
JWT_SECRET=your-super-secret-jwt-key-change-in-prod
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Important**: 
- Replace `MONGO_URI` with your MongoDB connection string
- Change `JWT_SECRET` to a secure random string in production

### 4. Start MongoDB

If using local MongoDB:
```bash
mongod
```

If using MongoDB Atlas, ensure your connection string is correct in `.env`.

### 5. Run the Application

#### Development Mode (runs both frontend and backend):
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

#### Run Separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm start
```

## Port Configuration

- **Frontend (Vite)**: Port 3000
- **Backend (Express)**: Port 3001

These ports are configured in:
- Frontend: `vite.config.mjs`
- Backend: `server.js` (PORT environment variable or default 3001)
- API Config: `src/config/api.config.js`

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change the port in vite.config.mjs or server.js
```

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your `MONGO_URI` in `.env`
- For Atlas: Whitelist your IP address

### CORS Errors
- Verify frontend runs on port 3000
- Check `server.js` CORS configuration matches frontend port

### Module Not Found
```bash
npm install
```

## User Roles

The application has three user roles:

1. **User** - Access to dashboard, blog, investments, finbot, and privileges
   - Routes: `/user/*`

2. **Advisor** - Financial advisor dashboard
   - Routes: `/advisor/*`

3. **Admin** - Full system administration
   - Routes: `/admin/*`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Privilege (User Features)
- `GET /api/privilege/insurances` - Get user insurances
- `GET /api/privilege/properties` - Get user properties
- `POST /api/privilege/properties` - Add new property
- `DELETE /api/privilege/properties/:id` - Delete property
- `GET /api/privilege/precious_holdings` - Get precious holdings
- `POST /api/privilege/precious_holdings` - Add new holding
- `GET /api/privilege/transactions` - Get recent transactions
- `POST /api/privilege/seed` - Generate sample insurance data

## Project Structure

```
DRAKZ-1/
├── public/              # Static assets
├── src/
│   ├── api/            # Axios API configuration
│   ├── auth/           # Authentication components
│   ├── components/     # React components (organized by team member)
│   ├── config/         # Configuration files
│   ├── controllers/    # Backend controllers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── styles/         # CSS files (organized by team member)
│   └── utils/          # Utility functions
├── mongodb/            # MongoDB schema files
├── scripts/            # Seed scripts
├── server.js           # Express server entry point
├── package.json        # Dependencies and scripts
└── vite.config.mjs     # Vite configuration
```

## Development Notes

### Adding New Features
1. Create components in `src/components/[your-name]/`
2. Add styles in `src/styles/[your-name]/`
3. Import your CSS in `src/App.css`
4. Add routes in `src/App.jsx`
5. Create backend routes/controllers if needed

### Database Models
Models are located in `src/models/`:
- `insurance.model.js`
- `property.model.js`
- `preciousHolding.model.js`
- `transaction.model.js`
- `people.model.js`
- `blog.model.js`

## Common Issues & Solutions

### 1. "Cannot find module" errors
```bash
npm install
```

### 2. MongoDB connection timeout
- Check if MongoDB is running
- Verify connection string in `.env`

### 3. Authentication errors
- Clear browser localStorage
- Check JWT_SECRET is set in `.env`
- Verify token expiry (default: 8h)

### 4. API calls failing
- Ensure backend is running on port 3001
- Check network tab in browser DevTools
- Verify API base URL in `src/config/api.config.js`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Testing

```bash
# Test backend connection
npm run test-servers
```

## Support

For issues or questions, please contact the development team or create an issue on GitHub.
