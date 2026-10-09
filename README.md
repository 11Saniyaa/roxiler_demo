# Roxiler Stores

A store rating platform with one login and three roles: system administrator, normal user, and store owner.

## Stack

- Backend: Express, JWT, bcrypt
- Database: MySQL
- Frontend: React (Vite)

## Run locally

MySQL must be running. Copy `backend/.env.example` to `backend/.env` and set the database credentials and a long `JWT_SECRET`. The API creates the `roxiler_stores` database, tables, and demo data on first start.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

Open http://localhost:5173. The API listens on http://localhost:5000.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| System Administrator | admin@roxiler.com | Admin@123 |
| Normal User | alexandra.miller@example.com | User@1234 |
| Store Owner | margaret.thompson@greenwood.com | Owner@123 |

Names must be 20–60 characters. Passwords must be 8–16 characters and include an uppercase letter and a special character. Addresses are limited to 400 characters.

## Roles

- **System administrator** sees totals for users, stores, and ratings; adds normal users, administrators, and stores (with a store owner); filters and sorts user and store lists; opens a user record, including the store rating when the person is a store owner.
- **Normal user** signs up, updates their password, searches stores by name and address, and submits or changes a rating from 1 to 5.
- **Store owner** updates their password and sees who rated their store plus the average rating.

Normal users are the only role that can self-register. Store owners are created when an administrator adds a store.
