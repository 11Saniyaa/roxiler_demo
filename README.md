# Roxiler Stores

A store-rating web application with one login. After sign-in, each person sees only the screens for their role: system administrator, normal user, or store owner.

## Stack

- **Backend:** Express, JWT, bcrypt
- **Database:** MySQL
- **Frontend:** React (Vite)

Passwords are hashed. Database queries are parameterized. Every protected route checks the signed-in role.

## Roles

**System administrator**

- Views totals for users, stores, and submitted ratings
- Adds normal users and other administrators
- Adds a store together with its owner account
- Filters user and store lists by name, email, and address, and filters users by role
- Sorts every list ascending or descending
- Opens a user record. A store owner’s record also shows that store’s average rating

**Normal user**

- Signs up and logs in
- Updates their password
- Searches stores by name and address
- Sees each store’s overall rating and their own rating
- Submits or changes a rating from 1 to 5

**Store owner**

- Logs in and updates their password
- Sees the people who rated their store
- Sees the store’s average rating

Normal users are the only role that can self-register. Store owners are created when an administrator adds a store. Anyone signed in can log out.

The public home page lists registered stores and their average ratings. Submitting a rating requires a normal-user login.

## Form rules

| Field | Rule |
| --- | --- |
| Name | 20–60 characters |
| Address | Required, at most 400 characters |
| Password | 8–16 characters, at least one uppercase letter and one special character |
| Email | Standard email format |
| Rating | Whole number from 1 to 5 |

The same rules are enforced in the browser and on the API.

## Run locally

Requirements: Node.js 20 or newer, and MySQL 8 running on localhost.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Copy the environment example and set your MySQL password and a long `JWT_SECRET`:

```bash
# macOS / Linux
cp backend/.env.example backend/.env

# Windows PowerShell
copy backend\.env.example backend\.env
```

`backend/.env` is not committed. On first start the API creates the `roxiler_stores` database, the tables, and the demo data below.

```bash
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:5000

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| System administrator | admin@roxiler.com | Admin@123 |
| Normal user | alexandra.miller@example.com | User@1234 |
| Store owner | margaret.thompson@greenwood.com | Owner@123 |

Two more normal users and two more store owners are seeded so the dashboards and ratings are not empty. They use the same passwords as the accounts in the table above.

## Tests

```bash
npm test
```

This checks the name, address, email, password, and rating rules, and checks that sort fields cannot be injected into SQL.

## Project layout

```
backend/src          Express API, MySQL schema setup, and seed data
backend/schema.sql   Table definitions
frontend/src         React pages for the directory, login, and each role
```

Main API routes:

| Method | Path | Who |
| --- | --- | --- |
| GET | `/api/catalog/stores` | Public store directory |
| POST | `/api/auth/register` | New normal user |
| POST | `/api/auth/login` | All roles |
| PUT | `/api/auth/password` | Signed-in user |
| GET | `/api/admin/stats` | Administrator |
| GET, POST | `/api/admin/users` | Administrator |
| GET, POST | `/api/admin/stores` | Administrator |
| GET | `/api/stores` | Normal user |
| PUT | `/api/stores/:id/rating` | Normal user |
| GET | `/api/owner/dashboard` | Store owner |
