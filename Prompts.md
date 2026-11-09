# Salary Management System – React Frontend

Build the frontend for an Organisation-Based Salary Management System using React.js.

### Technology

- React.js with Vite.
- JavaScript.
- Axios for Rails API integration.
- React Router for navigation.
- Bootstrap or simple CSS for styling.

The backend is a separate Ruby on Rails application using PostgreSQL.

### 1. User Roles

Implement role-based dashboards for:

**Organisation Admin**

- View organisation dashboard.
- View employee list.
- Create and manage HR users.
- Create, edit and manage employees.

**HR**

- View HR dashboard.
- Create and edit employees.
- Manage employee salary details.
- Generate salary slips.
- View salary history.

**Employee**

- View own dashboard.
- View own profile.
- View own salary details.
- View and download own salary slips.

Super Admin will NOT have a React panel. The Super Admin interface is built separately using Rails views.

### 2. Pages

Create the following pages:

- Login Page
- Dashboard
- Employee List
- Create Employee
- Edit Employee
- HR Management
- Create HR
- Employee Profile
- Salary Management
- Create/Edit Salary
- Salary History
- Salary Slip

### 3. Frontend Structure

Follow this folder structure:

```text
src/
├── components/
├── pages/
│   ├── auth/
│   ├── organization/
│   ├── hr/
│   └── employee/
├── services/
│   └── api.js
├── routes/
├── hooks/
├── context/
├── utils/
├── App.jsx
└── main.jsx
```

### 4. API Integration

- Connect React with Rails REST APIs using Axios.
- Keep API calls inside the services folder.
- Handle login and logout.
- Store authentication securely.
- Send authentication credentials with API requests.
- Handle loading states and API errors.
- Refresh data after create, update and delete operations.

### 5. Role-Based Access

- Show pages based on logged-in user's role.
- Organisation Admin can access only organisation management features.
- HR can access employee and salary management.
- Employees can access only their own profile and salary details.
- Prevent unauthorized navigation.
- Never rely only on frontend permissions; Rails will validate every request.

### 6. UI Requirements

- Build a clean and simple dashboard.
- Add sidebar navigation.
- Add tables for employees and salaries.
- Add create and edit forms.
- Add confirmation dialogs for important actions.
- Add search and pagination.
- Make the UI responsive.
- Show proper success and error messages.

### 7. Development Instructions

- Use simple, readable React code.
- Use reusable components.
- Keep API logic separate from UI components.
- Follow proper React hooks and component structure.
- Do not duplicate code.
- Do not implement backend logic in React.
- Use the Rails APIs for all database operations.

First create the project structure, routing, login and role-based dashboards. Then implement employee management, HR management and salary management step by step. Test each module with the Rails backend APIs.
