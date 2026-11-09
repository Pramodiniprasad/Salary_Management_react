# Salary Management frontend

Responsive React + Vite frontend for an organisation-based salary management system. The Rails API is a separate application; this project does not include backend or database logic.

## Run locally

```sh
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the Rails API base URL (the example uses `http://localhost:3000/api/v1`). The Rails server must allow the frontend origin through CORS and support credentialed requests.

## Rails API contract

Requests are made through Axios in `src/services/api.js`. The frontend expects these REST endpoints below the configured base URL:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Sign in with `{ email, password }`; return `{ user, token }` or `{ user, access_token }` (a Rails session cookie is also supported) |
| GET | `/auth/me` | Return the authenticated user |
| DELETE | `/auth/logout` | End the authenticated session |
| GET, POST | `/employees` | List and create employees |
| GET, PATCH, DELETE | `/employees/:id` | Read, update, and remove employee records |
| GET | `/employees/me` | Return the authenticated employee’s own profile |
| GET, POST | `/hr_users` | List and create HR users |
| DELETE | `/hr_users/:id` | Remove an HR user |
| GET, POST | `/salaries` | List and create salary records |
| GET, PATCH | `/salaries/:id` | Read and update salary records |
| GET, POST | `/salary_slips` | List slips and generate slips for a `pay_period` |
| GET | `/salary_slips/:id` | Read a payslip |
| GET | `/salary_slips/:id/download` | Return the payslip PDF |

Collection responses may be arrays or wrapped in a resource key, `data`, or `items`. The current user response should include a `role` (or `user_type` / `account_type`) with `organization_admin`, `hr`, or `employee`. The Rails application must enforce roles, organisation scoping, ownership, validation, and CSRF protections on every request; client-side route checks are only a navigation aid.

When the login response includes a bearer token, it is held in `sessionStorage` and sent as an Authorization header. For stronger protection, prefer Rails-managed `HttpOnly`, `Secure`, `SameSite` session cookies; the browser frontend cannot make a JavaScript-managed token HttpOnly.

## Included workspace

- Role-aware dashboard and protected navigation; no Super Admin React panel.
- Employee directory, create/edit forms, and employee profile.
- HR account management for Organisation Admin.
- Salary records, history, payslip viewing, and PDF download.
- Searchable, paginated tables and responsive layouts.

The Rails API is not part of this repository, so live authentication and API workflows must be verified against the deployed Rails routes.