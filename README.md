# Employee Tracker Application

A full-stack application for tracking employees, tasks, and monitoring activities, with admin and user roles. Built with a React frontend, Node.js/Express backend, MongoDB, and Electron desktop integration. Includes SharePoint integration for screenshot uploads.

## Features

- **User Authentication**: Secure login/signup with JWT-based authentication.
- **Admin Dashboard**: Manage users, assign roles, and view employee data.
- **Task Management**: Assign, track, and update tasks for employees.
- **Monitoring**: Capture and upload screenshots to SharePoint for monitoring.
- **Electron Desktop App**: Desktop client for screenshot capture and uploads.
- **Role-Based Access**: Admin and employee roles with different permissions.

## Tech Stack

- **Frontend**: React, JavaScript, CSS
- **Backend**: Node.js, Express, MongoDB
- **Desktop**: Electron
- **Cloud Storage**: Microsoft SharePoint (via OneDrive API)
- **Authentication**: JWT, bcrypt

## Folder Structure

```text
employee-tracker-application/
  client/      # React frontend
  desktop/     # Electron desktop app
  server/      # Node.js/Express backend
  shared/      # Shared types and utilities
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)
- Microsoft 365 account (for SharePoint integration)

### 1. Clone the Repository

```bash
git clone https://github.com/shlok3640/employee-tracker-application.git
cd employee-tracker-application
```

### 2. Setup Environment Variables

- Copy `server/env-template.txt` to `server/.env` and fill in the required values (MongoDB URI, JWT secret, SharePoint credentials, etc.).

### 3. Install Dependencies

Install dependencies for each part:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# Desktop
cd ../desktop
npm install

# Shared (if used)
cd ../shared
npm install
```

### 4. Run the Application

#### Start the Backend Server

```bash
cd server
npm start
```

#### Start the Frontend (React)

```bash
cd client
npm start
```

#### Start the Desktop App (Electron)

```bash
cd desktop
npm start
```

## API Endpoints

- `POST /api/auth/login` — User login
- `POST /api/auth/signup` — Admin creates new user
- `GET /api/auth/users` — Get all users (admin only)
- `DELETE /api/auth/users/:id` — Delete user (admin only)
- `POST /api/auth/create-initial-admin` — Create first admin if none exists
- `POST /api/monitoring/upload` — Upload screenshot (desktop app)
- ...and more (see `server/routes/`)

## SharePoint Integration

See [`server/ONEDRIVE_SETUP.md`](server/ONEDRIVE_SETUP.md) for detailed setup instructions for SharePoint/OneDrive integration.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

## License

[MIT](LICENSE)

---

**Maintainer:** [@shlok3640](https://github.com/shlok3640)
