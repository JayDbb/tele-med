# Medical Dashboard

A React TypeScript medical dashboard application with mock data, designed to integrate with a future backend API.

## Features

- Patient appointment management
- Daily timeline view
- Patient condition statistics
- Important updates feed
- Search functionality
- Responsive design with dark mode support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Backend Integration

The app is structured to easily integrate with a backend API:

- **API Service Layer**: `src/services/api.ts` - Replace mock data calls with actual HTTP requests
- **Type Definitions**: `src/types/index.ts` - Data contracts for API responses
- **Environment Config**: `.env.example` - Copy to `.env` and set your API URL

### API Endpoints Expected

- `GET /api/patients` - List of patients
- `GET /api/timeline` - Daily timeline events
- `GET /api/patient-conditions` - Patient condition statistics
- `GET /api/updates` - Important updates
- `GET /api/user` - Current user info
- `GET /api/patients/search?q=query` - Search patients

## Project Structure

```
src/
├── components/     # React components
├── data/          # Mock data
├── services/      # API service layer
├── types/         # TypeScript interfaces
└── App.tsx        # Main app component
```