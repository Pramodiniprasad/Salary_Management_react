# Salary Management Frontend — Requirements

## Goal

Provide a responsive React application for organisation administrators, HR staff, and employees to manage and view employee and salary information through the existing Ruby on Rails API. The frontend is a user interface—not an authority for access control, business rules, or data storage.

## Scope and features

- **Authentication and access:** Sign in and sign out using the API’s bearer-token contract; load the current user; show role-appropriate pages for organisation admins, HR, and employees. Handle expired or rejected sessions. Rails remains responsible for authorization and organisation scoping.
- **Organisation admin and HR workflows:** View and manage employees as permitted by the API, create employee accounts and profiles, and manage HR users where supported. Show employee status in understandable terms while sending the API’s expected status value.
- **Salary workflows:** View and manage salary records; create and view salary slips; show employee and organisation names when provided or joinable from API data; filter slips by payment status; print slips or save them through the browser’s print dialog.
- **Employee self-service:** View the signed-in employee’s own profile, salary information, and slips. Allow the signed-in user to update their own profile and password through the current-user endpoint.
- **Shared interface:** Responsive navigation and forms, clear loading/error/success feedback, password visibility controls, and confirmation for consequential actions. Keep API calls in the services layer and UI reusable.
- **Integration:** Use React, Vite, JavaScript, Axios, and React Router. Proxy `/api` requests to the Rails service during local development. Validate the frontend with a production build; verify live workflows against a running Rails API.

## Deliberately out of scope

- **Super Admin dashboard or organisation administration:** Super Admin uses the separate Rails interface; the API does not provide frontend organisation create/edit workflows.
- **Backend responsibilities:** No database, salary calculations, authentication/authorization rules, tenant isolation, or validation are implemented in React. These belong to Rails and must be enforced server-side.
- **Changing another user’s password:** The documented password update applies to the signed-in user and requires their current password. No supported endpoint for an administrator to set an employee’s password has been established.
- **Dedicated salary-history module:** There is no separate salary-history endpoint in the contract; salary records and slips are surfaced through Salary Management instead.
- **Native payslip/PDF generation and payment processing:** No PDF download or payment-provider endpoint is documented. Printing and saving as PDF are browser capabilities; payment status is recorded through the API.
- **Offline mode, multi-factor authentication, and cross-origin API configuration:** These are not specified by the current API contract and would require backend/product decisions.

## Assumptions and constraints

The Rails API is available separately and follows the documented `/api/v1` contract. Its responses are authoritative, including calculated salary amounts and user permissions. A development proxy avoids requiring browser CORS configuration. Frontend role checks improve navigation and usability but never replace server-side access checks.
