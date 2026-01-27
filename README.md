# Lost and Found

A web-based platform to help users report and track lost and found items in their community (University Campuses, Neibourhoods, Hostels).

## Features

- User authentication and authorization
- Report lost items with descriptions and details
- Report found items with descriptions and details
- Search and filter items by category, date, and location
- Match lost items with found items
- Contact system for item claims
- User dashboard to manage reports
- Admin panel for managing users and items

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB  
**Frontend:** HTML5, CSS3, JavaScript

## Project Structure

```
Lost-And-Found/
├── backend/           # Server-side application
│   ├── models/        # Database schemas
│   ├── routes/        # API endpoints
│   ├── controllers/   # Business logic
│   ├── middleware/    # Authentication & validation
│   └── server.js      # Main server file
├── frontend/          # Client-side application
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── pages/         # HTML pages
│   └── assets/        # Images and static files
└── .gitignore
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lost-and-found
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

4. Start the server
```bash
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

2. Serve with a static server

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

3. Access the application
```
http://localhost:8000
```

## Configuration

Update API endpoint in frontend JavaScript files if needed:
```javascript
const API_URL = 'http://localhost:5000/api';
```

## Usage

### For Users

1. Register or login to your account
2. Report a lost item with details (category, description, date, location)
3. Browse found items to see if your item has been reported
4. Report a found item if you found something
5. Contact the person who reported a matching item
6. Manage your reports from the dashboard

### For Administrators

1. Login with admin credentials
2. Access admin dashboard
3. Manage users and their permissions
4. Review and moderate item reports
5. Handle disputes and claims
6. Monitor platform activity

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Lost Items
- `POST /api/lost-items` - Create lost item report
- `GET /api/lost-items` - Get all lost items
- `GET /api/lost-items/:id` - Get single lost item
- `PUT /api/lost-items/:id` - Update lost item
- `DELETE /api/lost-items/:id` - Delete lost item

### Found Items
- `POST /api/found-items` - Create found item report
- `GET /api/found-items` - Get all found items
- `GET /api/found-items/:id` - Get single found item
- `PUT /api/found-items/:id` - Update found item
- `DELETE /api/found-items/:id` - Delete found item

### Claims
- `POST /api/claims` - Submit item claim
- `GET /api/claims` - Get user claims
- `PUT /api/claims/:id` - Update claim status

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Lost Item Model
```javascript
{
  user: ObjectId (ref: User),
  category: String,
  title: String,
  description: String,
  date: Date,
  location: String,
  status: String (active/claimed/closed),
  createdAt: Date
}
```

### Found Item Model
```javascript
{
  user: ObjectId (ref: User),
  category: String,
  title: String,
  description: String,
  date: Date,
  location: String,
  imageUrl: String,
  status: String (active/claimed/closed),
  createdAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable management

## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Verify connection string in `.env`

**CORS Issues**
- Check backend CORS configuration
- Verify frontend API URL matches backend

**Authentication Fails**
- Clear browser cache and localStorage
- Check JWT token validity
- Verify credentials

**Port Already in Use**
- Change PORT in `.env` file
- Kill existing process on the port

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License - Free to use for personal and educational purposes.

## Contact

For issues and questions, please open an issue in the repository.
