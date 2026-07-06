# cloud-mastery-backend

Backend service built with NestJS and Prisma (MySQL).

## Installation

1. Clone the repository and then install required dependencies

```
git clone git@github.com:Pawa-IT-Solutions/cloud-mastery-backend.git
```

2. Navigate to the target directory

```
cd cloud-mastery-backend
```

3. Install dependencies

```bash
$ npm install
```

4. Configure environment variables

```
cp .env.example .env
```

```
MYSQL_PRISMA_URL="mysql://username:password@127.0.0.1:3306/database_name"
```

5. Run database seed

```
npm run seed
```

## Apply migrations
1. Generate Prisma Client
```
npx prisma generate
```
2. Create and Apply Migration
```
npx prisma migrate dev --name init
```

This will create a migration file based on your schema and apply the migration to your database

## GCP Cloud SQL Migration (MySQL)

Use this when moving reads/writes for `orders`, `order_details`, `customers`, and `products` to Cloud SQL.

1. Create Cloud SQL MySQL resources

- Create MySQL instance
- Create database (example: `cloud_mastery`)
- Create DB user with least privileges for app runtime

2. Configure backend connection string

- Prisma already reads from `MYSQL_PRISMA_URL` in `prisma/schema.prisma`.
- Set `MYSQL_PRISMA_URL` depending on runtime:

```bash
# Local via Cloud SQL Auth Proxy (recommended for dev)
MYSQL_PRISMA_URL="mysql://<DB_USER>:<DB_PASS>@127.0.0.1:3306/<DB_NAME>"

# Cloud Run with Cloud SQL socket mounted at /cloudsql
MYSQL_PRISMA_URL="mysql://<DB_USER>:<DB_PASS>@localhost:3306/<DB_NAME>?socket=/cloudsql/<PROJECT_ID>:<REGION>:<INSTANCE_NAME>"
```

3. Run Cloud SQL Auth Proxy locally (dev)

```bash
cloud-sql-proxy <PROJECT_ID>:<REGION>:<INSTANCE_NAME> --port 3306
```

If you get `command not found` for `cloud-sql-proxy`, install it first:

```bash
brew install cloud-sql-proxy
```

Troubleshooting common Prisma error:

- `PrismaClientInitializationError: Can't reach database server at /cloudsql/...:3306`
	- Cause: using Cloud Run unix-socket URL in local development without socket mount.
	- Fix (local): use `MYSQL_PRISMA_URL="mysql://<DB_USER>:<DB_PASS>@127.0.0.1:3306/<DB_NAME>"` and run Cloud SQL proxy.
	- Fix (Cloud Run): keep socket URL format with `?socket=/cloudsql/<INSTANCE_CONNECTION_NAME>` and deploy with Cloud SQL instance attachment.

4. Apply schema and generate client against Cloud SQL

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

5. (Optional) Seed baseline data

```bash
npm run seed
```

6. Verify API reads from Cloud SQL

```bash
curl -X GET http://localhost:8080/api/v1/customers
curl -X GET http://localhost:8080/api/v1/products
curl -X GET http://localhost:8080/api/v1/orders
```

If these endpoints return Cloud SQL-backed data, your frontend routes for orders and products are now sourcing from Cloud SQL through the backend.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Endpoints

1. Get Customers

```
curl -X GET http://localhost:PORT/api/v1/customers
```

2. Get Products

```
curl -X GET http://localhost:PORT/api/v1/products
```

3. Get Orders

```
curl -X GET http://localhost:PORT/api/v1/orders
```
## Test

```bash
# unit tests
$ npm run test
