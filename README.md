# Retail Ordering Platform

A full-stack single-store retail ordering application with:

- ASP.NET Core 8 Web API backend
- Angular 19 frontend
- SQLite database (auto-created)
- JWT authentication with role-based access
- Cart, checkout, orders, promotions, coupons, loyalty points, and admin management

## Tech Stack

### Backend
- .NET 8 / ASP.NET Core Web API
- Entity Framework Core 8 + SQLite
- JWT Bearer authentication
- BCrypt password hashing
- Swagger/OpenAPI
- Built-in rate limiting and CORS policy

### Frontend
- Angular 19
- RxJS
- Angular Router + route guards
- HTTP interceptor for JWT token injection

## Repository Structure

```text
retail/
  backend/      ASP.NET Core API
  frontend/     Angular app
  retail.sln    Solution file
```

## Core Features

### Customer Features
- Register and login
- Browse and filter products by category/brand
- Add/update/remove cart items
- Apply coupon at checkout
- Place order
- View order history
- View and update profile
- View loyalty points
- View active promotions

### Admin Features
- Create, update, delete products
- View and update inventory
- Create promotions
- View all orders
- Access admin panel route

### Security and Platform Features
- JWT-based auth and role claims
- Role-based endpoint authorization
- Fixed-window API rate limiting: 120 requests/minute
- Localhost-only CORS policy for browser clients
- Swagger UI with Bearer auth support

## Seeded Demo Accounts

Database seeding creates these users on first startup:

- Admin:
  - Email: `admin@retail.com`
  - Password: `Admin@1234`
- Customer:
  - Email: `customer@retail.com`
  - Password: `Customer@1234`

## Prerequisites

- .NET SDK 8.x
- Node.js 18+ (or newer LTS)
- npm

## Getting Started

## 1) Backend Setup (API)

```bash
cd backend
dotnet restore
dotnet run
```

Backend default URL:

- `http://localhost:5000`

Swagger UI:

- `http://localhost:5000/swagger`

Notes:
- SQLite DB file is created automatically using `Data Source=retail-ordering.db`.
- On startup, the app ensures DB creation and seeds initial data.

## 2) Frontend Setup (Angular)

```bash
cd frontend
npm install
npm start
```

Angular dev server default URL:

- `http://localhost:4200`

Build frontend:

```bash
npm run build
```

## Configuration

### Backend Configuration

File: `backend/appsettings.json`

- Connection string (SQLite)
- JWT settings:
  - `Key`
  - `Issuer`
  - `Audience`
  - `ExpiryMinutes` (currently 720)

### Frontend API Base URL

File: `frontend/src/app/services/api.service.ts`

- Base URL is currently hardcoded to:
  - `http://localhost:5000/api`

If backend URL changes, update this value.

## Frontend Route Map

Defined in `frontend/src/app/app.routes.ts`:

- `/` Home
- `/products` Product listing
- `/login` Login
- `/register` Register
- `/cart` Authenticated customer only
- `/checkout` Authenticated customer only
- `/order-confirmation` Authenticated customer only
- `/orders` Authenticated customer only
- `/profile` Authenticated users
- `/admin` Admin only

Guards used:
- `authGuard`
- `notAdminGuard`
- `adminGuard`

## Authentication Flow

1. Login/Register returns JWT + user profile.
2. Frontend stores token in `localStorage` (`retail_token`).
3. `jwtInterceptor` adds `Authorization: Bearer <token>` to requests.
4. Backend validates token and role claims.

## API Reference

Base path: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new customer |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/profile` | Yes | Current user profile |
| PUT | `/auth/profile` | Yes | Update current user profile |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | List products (optional query: `category`, `brand`) |
| GET | `/products/{id}` | No | Product details |
| POST | `/products` | Admin | Create product |
| PUT | `/products/{id}` | Admin | Update product |
| DELETE | `/products/{id}` | Admin | Delete product |

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Customer | Get cart |
| POST | `/cart/add` | Customer | Add cart item |
| PUT | `/cart/update` | Customer | Update quantity |
| DELETE | `/cart/remove/{id}` | Customer | Remove item |
| DELETE | `/cart/clear` | Customer | Clear cart |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Customer | Place order (`couponCode` optional) |
| GET | `/orders` | Yes | Current user orders |
| GET | `/orders/{id}` | Yes | Current user order details |
| GET | `/orders/all` | Admin | All orders |

### Coupons

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/coupons/validate` | No | Validate coupon for amount |

### Promotions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/promotions` | No | Active promotions |
| POST | `/promotions` | Admin | Create promotion |

### Inventory

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/inventory` | Admin | List inventory |
| PUT | `/inventory/{productId}` | Admin | Update stock quantity |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/loyalty` | Yes | Current user loyalty points |

## Business Rules

- Admin users are forbidden from cart and checkout order creation operations.
- Cart quantity cannot exceed available inventory.
- Order creation:
  - Validates stock
  - Applies optional coupon
  - Creates order + order items in transaction
  - Deducts inventory
  - Adds loyalty points (`floor(finalAmount / 10)`)
  - Clears cart
  - Logs simulated order confirmation email

## Database Entities (High Level)

- `User`
- `Product`
- `Inventory` (1:1 with Product)
- `CartItem`
- `Order`
- `OrderItem`
- `Coupon`
- `Promotion`

## Development Notes

- Launch profile runs API at `http://localhost:5000` and opens Swagger.
- CORS allows `localhost` and `127.0.0.1` origins over HTTP/HTTPS.
- API rate limiter policy is applied globally to controller routes.

## Useful Commands

### Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm start
npm run build
```

### From Solution Root

```bash
dotnet build retail.sln
```

## Troubleshooting

### Frontend cannot reach API
- Ensure backend is running at `http://localhost:5000`.
- Ensure frontend uses matching API base URL in `ApiService`.

### 401 Unauthorized
- Login again to refresh token in `localStorage`.
- Verify token is sent by interceptor in request headers.

### 403 Forbidden
- You are accessing an admin/customer-only endpoint with the wrong role.

### 429 Too Many Requests
- You exceeded API rate limit (120 requests/minute).

### Database reset for clean seed
- Stop backend
- Delete `backend/retail-ordering.db` (if present)
- Start backend again to re-create and reseed data

## License

This project currently has no explicit license file in the repository.
Add a LICENSE file if you plan to distribute it.
