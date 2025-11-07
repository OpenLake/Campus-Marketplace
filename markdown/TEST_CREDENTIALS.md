# Test Credentials for Campus Marketplace

## Authentication Testing

All users have been successfully registered and tested for login functionality.

### Test Users

| Role         | Username       | Email                         | Password      | Status     |
| ------------ | -------------- | ----------------------------- | ------------- | ---------- |
| Student      | `student_demo` | `student_demo@university.edu` | `password123` | ✅ Working |
| Vendor Admin | `vendor_demo`  | `vendor_demo@university.edu`  | `password123` | ✅ Working |
| Club Admin   | `club_demo`    | `club_demo@university.edu`    | `password123` | ✅ Working |
| Moderator    | `mod_demo`     | `mod_demo@university.edu`     | `password123` | ✅ Working |
| Admin        | `admin_demo`   | `admin_demo@university.edu`   | `password123` | ✅ Working |

## Backend Configuration

- **Backend URL**: `http://localhost:3000`
- **Frontend URL**: `http://localhost:5173`
- **MongoDB URL**:
  - Docker: `mongodb://mongodb:27017/campus-marketplace` (internal)
  - Local: `mongodb://localhost:27017/campus-marketplace`
- **Database Name**: `campus-marketplace`

## Local Development Setup (Alternative)

### Local Test Users

| Role         | Username       | Email                         | Password      | Status     |
| ------------ | -------------- | ----------------------------- | ------------- | ---------- |
| Student      | `student_demo` | `student_demo@university.edu` | `password123` | ✅ Working |
| Vendor Admin | `vendor_demo`  | `vendor_demo@university.edu`  | `password123` | ✅ Working |
| Club Admin   | `club_demo`    | `club_demo@university.edu`    | `password123` | ✅ Working |
| Moderator    | `mod_demo`     | `mod_demo@university.edu`     | `password123` | ✅ Working |
| Admin        | `admin_demo`   | `admin_demo@university.edu`   | `password123` | ✅ Working |

### Running Locally

```bash
# Stop Docker first
docker-compose down

# Start MongoDB locally (if not running)
# mongod --dbpath /path/to/data

# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

## Authentication Endpoints

### Register

```bash
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "name": "string"
}
```

### Login

```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "string",  # or "username": "string"
  "password": "string"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "username": "string",
      "email": "string",
      "roles": ["array"],
      ...
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token"
  }
}
```

## Testing Results

### ✅ Docker Tests (All Passed)

- All containers running successfully (MongoDB, Backend, Frontend)
- User registration working for all roles
- Login authentication working for all roles
- JWT token generation working
- All role-based logins verified

### ✅ Local Tests (All Passed)

- MongoDB connection established successfully
- User registration working for all roles
- Password hashing working correctly (bcrypt)
- Login authentication working for all roles
- JWT token generation working (access + refresh tokens)
- User data correctly stored in database
- All role-based logins verified

### 📝 Next Steps

1. Test frontend registration/login UI
2. Verify token storage in browser (localStorage)
3. Test protected routes with different roles
4. Verify role-based access control
5. Test token refresh mechanism

## Docker Setup (Recommended)

### Running with Docker

The application can run entirely in Docker containers, which is the **recommended approach**:

```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Check container status
docker ps

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Docker Test Users

| Role         | Username         | Email                           | Password      | Status     |
| ------------ | ---------------- | ------------------------------- | ------------- | ---------- |
| Student      | `student_docker` | `student_docker@university.edu` | `password123` | ✅ Working |
| Vendor Admin | `vendor_docker`  | `vendor_docker@university.edu`  | `password123` | ✅ Working |
| Club Admin   | `club_docker`    | `club_docker@university.edu`    | `password123` | ✅ Working |
| Moderator    | `mod_docker`     | `mod_docker@university.edu`     | `password123` | ✅ Working |
| Admin        | `admin_docker`   | `admin_docker@university.edu`   | `password123` | ✅ Working |

### Access Docker MongoDB

```bash
# Connect to MongoDB in Docker container
docker exec -it campus-marketplace-mongo mongosh campus-marketplace

# Query users
docker exec campus-marketplace-mongo mongosh campus-marketplace --eval 'db.users.find({}, {username: 1, email: 1, roles: 1}).pretty()'
```

## Important Notes

1. **Docker vs Local**:

   - **Docker (Recommended)**: Everything runs in containers, isolated and consistent
   - **Local**: Requires local MongoDB and Node.js, good for development
   - **Important**: Don't run both simultaneously to avoid port conflicts!

2. **Multiple Backend Instances**: Only one backend instance should be running at a time on port 3000.

3. **Role Assignment**: By default, all users are registered with the "student" role. Additional roles must be assigned manually via:

   - Admin API endpoint (future feature)
   - Direct database update (current method):

     ```bash
     # Docker
     docker exec campus-marketplace-mongo mongosh campus-marketplace --eval 'db.users.updateOne({username: "USERNAME"}, {$set: {roles: ["student", "ROLE"]}})'

     # Local
     mongosh "mongodb://localhost:27017/campus-marketplace" --eval 'db.users.updateOne({username: "USERNAME"}, {$set: {roles: ["student", "ROLE"]}})'
     ```

4. **Database**:
   - **Docker**: MongoDB runs in a container with persistent volume
   - **Local**: MongoDB runs on `localhost:27017` with database name `campus-marketplace`

## Test Commands

### Test All Role Logins

```bash
for user in student_demo vendor_demo club_demo mod_demo admin_demo; do
  echo "Testing $user"
  curl -s -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${user}@university.edu\", \"password\": \"password123\"}" | \
    jq -r '.data.user.roles'
done
```

### Check User in Database

```bash
mongosh "mongodb://localhost:27017/campus-marketplace" \
  --eval 'db.users.find({username: "student_demo"}, {username: 1, email: 1, roles: 1}).pretty()'
```

---

**Last Updated**: November 6, 2025  
**Status**: ✅ Docker and Local authentication both fully working  
**Recommendation**: Use Docker for consistent, isolated development environment
