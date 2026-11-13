# WoahNix

Personal media aggregation dashboard combining YouTube channels and Twitch live streams into one place.

## Project Structure

```
WoahNix/
├── frontend/       # React + Vite + Tailwind CSS dashboard
└── backend/        # Spring Boot + MongoDB REST API (upcoming)
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

To enable Spring Boot backend proxy and API mode when the backend is running:

```bash
cd frontend
VITE_USE_BACKEND_API=true npm run dev
```

## Frontend Production Build

```bash
cd frontend
npm run build
```
