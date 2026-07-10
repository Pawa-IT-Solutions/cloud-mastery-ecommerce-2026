# Shop Standalone App

This folder contains a standalone storefront split from the main dashboard:

- `frontend/`: Next.js storefront available at `/shop`
- `backend/`: NestJS API for storefront data

## Run Shop Backend

```bash
cd shop/backend
npm install
npm run start:dev
```

The backend listens on `http://localhost:8081` by default.

## Run Shop Frontend

```bash
cd shop/frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/shop`.

Set `NEXT_PUBLIC_API_URL` in `.env.local` if your backend URL is different.

## Frontend Notes

- Chat widget mobile containment strategy: google keep
