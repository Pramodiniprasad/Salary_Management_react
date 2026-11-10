# Salary Management frontend

Responsive React + Vite frontend for the Rails salary-management API. Rails remains responsible for authentication, authorization, organisation scoping, validation, and database operations.

## Run locally

1. Start the Rails API at `http://localhost:3000`.
2. In this directory, run:

   ```powershell
   npm install
   npm run dev
   ```

3. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

Vite proxies `/api/*` to Rails. The frontend calls the documented `/api/v1` API through that same-origin proxy.

## Authentication

- Sign in: `POST /api/v1/auth/sign_in` with `{ "user": { "email": "...", "password": "..." } }`.
- The Authorization token returned in the response header is retained for the browser session and sent on subsequent API requests.
- After sign in and on startup, `GET /api/v1/me` validates the token and loads the current user, including `organization: { name: ... }` when available.
- Sign out: `DELETE /api/v1/auth/sign_out`; the token and cached user are removed.
- Tokens expire after one hour. A `401` clears the local session and returns the user to login.
- `super_admin` accounts are directed to the separate Rails admin panel and are not given a React dashboard.

## Connected endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST, DELETE | `/api/v1/auth/sign_in`, `/api/v1/auth/sign_out` | Sign in and sign out |
| GET | `/api/v1/me` | Validate token and load current user |
| PATCH | `/api/v1/me` | Update the signed-in user’s name/email and, optionally, password with current-password verification |
| GET, POST | `/api/v1/users` | List organisation users; create HR accounts |
| GET | `/api/v1/employees`, `/api/v1/employees/:id` | List and view employees |
| POST | `/api/v1/users` then `/api/v1/employees` | Create the employee login, then create its linked employee profile |
| PATCH, DELETE | `/api/v1/employees/:id` | Update or remove employees |
| GET, POST | `/api/v1/salaries` | List and create salary records |
| GET, PATCH, DELETE | `/api/v1/salaries/:id` | View, update, and remove salary records |
| GET, POST | `/api/v1/salary_slips` | List slips and create a slip from a salary ID, month, and year |
| GET, PATCH | `/api/v1/salary_slips/:id` | View a slip and update its payment status |

The app header uses the current user's `organization.name`; printable salary slips use the organization included in the slip response.

Salary values such as gross and net salary are displayed from Rails responses; the frontend does not calculate them. Salary slips can be printed or saved as PDF using the browser because the API guide does not specify a PDF download endpoint.

Role-based route visibility is only a navigation aid. Rails must enforce authorization and data ownership for every request. Run `npm run build` to create the production bundle. The Rails API must be running to test authentication and data workflows.
