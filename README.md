# Task Manager API

A REST API built with Node.js, Express, and MongoDB. Supports JWT authentication, role-based access control (user vs admin), and full task CRUD. Includes a React frontend with separate user and admin panels.

---

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose)
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Docs:** Swagger UI
- **Frontend:** React 19, Vite, React Router v7

---

## Project Structure

```
educaseIndia/
├── backend/
│   ├── middleware/
│   │   ├── auth.js        # requireAuth + requireAdmin
│   │   └── validate.js    # input validation
│   ├── models/
│   │   ├── User.js        # fullName, email, password, role
│   │   └── Task.js        # title, description, status, priority, owner
│   ├── routes/
│   │   ├── auth.js        # register, login, me
│   │   ├── tasks.js       # user task CRUD
│   │   └── admin.js       # admin-only routes
│   ├── db.js
│   └── server.js
└── frontend/
    └── src/pages/
        ├── Landing.jsx
        ├── Login.jsx
        ├── Register.jsx
        ├── UserDashboard.jsx   # user panel
        └── AdminDashboard.jsx  # admin panel
```

---

## Setup

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

Runs at `http://localhost:5000`  
Swagger docs at `http://localhost:5000/api-docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register (choose role: user or admin) |
| POST | `/auth/login` | None | Login, returns JWT |
| GET | `/auth/me` | Bearer | Get current user |

**Register body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "user"
}
```

**Login body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

---

### Tasks (User only)

All routes require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get own tasks |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get one task (owner only) |
| PUT | `/tasks/:id` | Update a task (owner only) |
| DELETE | `/tasks/:id` | Delete a task (owner only) |

Query filters: `?status=todo|in-progress|done` and `?priority=low|medium|high`

**Create/Update task body:**
```json
{
  "title": "Build login page",
  "description": "Optional details",
  "status": "todo",
  "priority": "high"
}
```

A user cannot view, edit, or delete another user's tasks — returns `403 Forbidden`.

---

### Admin (Admin role only)

All routes require `Authorization: Bearer <admin_token>`  
Non-admins get `403 Forbidden`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all registered users |
| GET | `/admin/tasks` | List all tasks from all users |
| DELETE | `/admin/tasks/:id` | Delete any task |

---

## RBAC Summary

| Action | User | Admin |
|--------|------|-------|
| Register / Login | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| View own tasks | ✅ | ✅ |
| Edit / Delete own tasks | ✅ | ✅ |
| View another user's tasks | ❌ 403 | ✅ |
| Delete another user's tasks | ❌ 403 | ✅ |
| View all users | ❌ 403 | ✅ |
| Access `/admin/*` routes | ❌ 403 | ✅ |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing or invalid JWT |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Email already exists |
| 500 | Internal server error |

---

## Testing with Postman

1. **Register** — `POST /api/v1/auth/register` with `role: "user"` or `role: "admin"`
2. **Login** — `POST /api/v1/auth/login` → copy the `token` from the response
3. Set header on all protected requests: `Authorization: Bearer <token>`
4. **Create a task** — `POST /api/v1/tasks` with title, status, priority
5. **Get tasks** — `GET /api/v1/tasks`
6. **Update** — `PUT /api/v1/tasks/:id`
7. **Delete** — `DELETE /api/v1/tasks/:id`
8. **Admin — all users** — `GET /api/v1/admin/users` (admin token required)
9. **Admin — all tasks** — `GET /api/v1/admin/tasks` (admin token required)
10. **Admin — delete any task** — `DELETE /api/v1/admin/tasks/:id` (admin token required)

Or open `http://localhost:5000/api-docs`, click **Authorize**, paste your token, and test everything in the browser.

---

## Scalability Notes

- **Stateless JWT** — no server-side sessions, scales horizontally
- **API versioning** — all routes under `/api/v1/`, easy to add `/api/v2/`
- **Modular routes** — auth, tasks, admin are separate files, easy to split into microservices
- **MongoDB Atlas** — managed, supports replica sets and sharding
- **Next steps** — Redis for token blacklisting, Winston for structured logging, Docker for containerized deployment
