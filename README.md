# Finora - AI Expense & Budget Manager

Finora is a modern, full-stack personal finance workspace that turns everyday transactions into a clear monthly plan. It combines secure user-isolated records, practical budget controls, visual reports, recurring-payment awareness, and explainable AI-style insights in one responsive experience.

The project follows the supplied Expense & Budget Manager blueprint and is built as a GitHub-ready MERN portfolio application. It also includes a seeded in-memory mode, so reviewers can run the complete demo without provisioning MongoDB first.

## Demo account

```text
Email: demo@finora.app
Password: demo1234
```

The demo workspace is created automatically whenever `MONGODB_URI` is not configured.

## Highlights

- JWT authentication with bcrypt password hashing and rate-limited auth routes
- Strict ownership checks on all user financial records
- Income and expense CRUD with date, payment method, recurring status, and category
- Search and type/category filters with CSV export
- Default and custom income/expense categories
- Overall and per-category monthly budgets with live progress states
- Monthly income, expense, balance, savings-rate, cash-flow, and category reports
- Finora Intelligence: explainable budget pace, projection, category, and savings insights
- Loading, empty, error, confirmation, and validation states
- Responsive desktop, tablet, and mobile layouts
- Zero-config demo store plus production MongoDB/Mongoose models and indexes
- Security headers, restricted CORS, centralized errors, Zod validation, and payload limits

## Technology

| Layer | Technology |
| --- | --- |
| Client | React, TypeScript, Vite, React Router, Recharts, Lucide |
| API | Node.js, Express, Zod |
| Database | MongoDB, Mongoose, seeded in-memory development adapter |
| Security | JWT, bcryptjs, Helmet, CORS, express-rate-limit |
| Quality | Vitest, Supertest, TypeScript project checks |

## Architecture

```text
Browser
  -> React client
       -> AuthContext / FinanceContext
       -> typed API client
  -> Express REST API
       -> auth + validation middleware
       -> controllers and reports
       -> repository adapter
            -> MongoDB / Mongoose (configured environments)
            -> seeded memory store (zero-config demo)
```

```text
expense-budget-manager/
|-- client/
|   |-- src/
|   |   |-- components/     shared layout, modal, finance UI
|   |   |-- context/        authentication and finance state
|   |   |-- lib/            API and formatting utilities
|   |   `-- pages/          dashboard and management screens
|   `-- vite.config.ts
|-- server/
|   |-- src/
|   |   |-- config/         database connection
|   |   |-- controllers/    request and reporting logic
|   |   |-- data/           seeded local demo store
|   |   |-- middleware/     auth, validation, centralized errors
|   |   |-- models/         Mongoose domain models
|   |   |-- routes/         REST route definitions
|   |   `-- services/       MongoDB/memory repository adapter
|   `-- tests/              API and security checks
`-- screenshots/            portfolio captures
```

## Run locally

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB only when you want persistent production-style storage

### Start the zero-config demo

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and use the demo credentials above. The API runs at `http://localhost:5000/api`.

### Use MongoDB

1. Copy `server/.env.example` to `server/.env`.
2. Set a MongoDB connection string and a long random JWT secret.
3. Start the application with `npm run dev`.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finora
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Never commit `.env` files or real credentials.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the API and client together |
| `npm run build` | Create the production client bundle |
| `npm test` | Run API and client test suites |
| `npm run check` | Typecheck, test, and production-build the project |

## API overview

All private endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Authenticate |
| `GET/PUT` | `/api/auth/me` | Read or update preferences |
| `GET/POST` | `/api/categories` | List or create categories |
| `DELETE` | `/api/categories/:id` | Delete a custom category |
| `GET/POST` | `/api/transactions` | Filter or create transactions |
| `PUT/DELETE` | `/api/transactions/:id` | Update or delete an owned transaction |
| `GET` | `/api/transactions/export` | Download CSV data |
| `GET/POST` | `/api/budgets` | List or upsert monthly limits |
| `GET` | `/api/reports/monthly` | Monthly totals and six-month trend |
| `GET` | `/api/reports/categories` | Expense category breakdown |
| `GET` | `/api/insights` | Explainable monthly finance insights |

Responses use a consistent envelope:

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {}
}
```

## Security and privacy

- Passwords are hashed and never returned by the API.
- JWTs expire after seven days.
- Every query is scoped to the authenticated user.
- Transaction categories are checked for ownership and type compatibility.
- Request bodies are validated before controller execution.
- Auth endpoints are rate-limited.
- Production errors do not expose stack traces.
- MongoDB models include ownership, date, relationship, and unique indexes.

For a production deployment, use HTTPS, a managed MongoDB instance, a strong secret manager, strict production CORS, and an HTTP-only cookie session strategy.

## Finora Intelligence

The insight endpoint is deterministic and explainable: it analyses only the authenticated user's monthly totals, category mix, budget pace, recurring commitments, and projected spend. It does not transmit financial data to an external model. This makes the portfolio demo private, predictable, and usable without an AI API key; a future model provider can be placed behind the same endpoint.

## Current scope and future ideas

The v1 scope covers the complete primary workflow described in the project guide. Natural next additions are receipt capture, bank-statement import, savings goals, currency conversion, scheduled recurring-rule materialization, refresh-token rotation, and offline entry.

## Verification

`npm run check` performs TypeScript validation, API tests for health/authentication/authorization, and a production Vite build. Run it before opening a pull request.
