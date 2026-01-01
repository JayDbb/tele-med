# Medical Dashboard

A modern medical dashboard built with Next.js, TypeScript, and Tailwind CSS for healthcare professionals.

## Features

- **Dashboard Overview**: Complete medical dashboard with sidebar navigation
- **Calendar Integration**: Interactive calendar with appointment scheduling
- **Patient Management**: Appointments list with status tracking
- **Timeline View**: Daily schedule and task management
- **Patient Analytics**: Visual charts showing patient conditions
- **Real-time Updates**: Important notifications and updates
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in dark/light theme switching

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Material Icons** - Google Material Design icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Supabase setup 🔧

1. Create a Supabase project at https://app.supabase.com and copy the **Project URL** and **anon (public) API key**.
2. Copy `.env.local.example` → `.env.local` and fill these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # optional for server operations
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```
3. (Optional) Install the Supabase CLI to link your repo to the Supabase project:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
   Note: `supabase login` opens a browser and requires your account credentials.

4. Restart the dev server so `process.env` picks up the new values:
   ```bash
   npm run dev
   ```

> Important: Never commit `.env.local` with real keys to source control. Keep secret keys (like `SUPABASE_SERVICE_ROLE_KEY`) restricted to server environments.

## Quick test script (automated)
If you'd like a quick local verification that auth and the `patients` API are wired correctly, start the dev server in a terminal and keep it running, then in a second terminal run:

```bash
# Make sure dev server is running (keep this terminal open):
npm run dev

# In a separate terminal run the test runner (it uses your .env.local):
node scripts/test-auth-and-patient.js
```

Notes:
- The test script will create a temporary user using the Supabase service role key and exercise the `GET /api/patients` and `POST /api/patients` endpoints.
- If the dev server is unreachable (connection refused), ensure the dev server terminal is still running and listening on http://localhost:3000 or 3001 (the script attempts 127.0.0.1 fallback as well).

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Calendar.tsx       # Calendar widget
│   ├── Timeline.tsx       # Daily timeline
│   ├── Appointments.tsx   # Appointments list
│   ├── AppointmentDetail.tsx # Patient details
│   ├── PatientConditions.tsx # Analytics chart
│   ├── ImportantUpdates.tsx  # Updates panel
│   └── SearchBar.tsx      # Search functionality
├── types/                 # TypeScript interfaces
└── tailwind.config.ts     # Tailwind configuration
```

## Components

### Sidebar
- Navigation menu with active states
- User profile section
- Material Design icons

### Calendar
- Interactive monthly calendar
- Current date highlighting
- Navigation controls

### Timeline
- Daily schedule overview
- Status indicators
- Time-based layout

### Appointments
- Patient appointment list
- Status badges (Done, Current, Upcoming)
- Interactive rows

### Patient Analytics
- Donut chart visualization
- Patient condition breakdown
- Real-time statistics

## Customization

### Theme Colors
The dashboard uses a custom color palette defined in `tailwind.config.ts`:
- Primary: `#137fec` (Medical blue)
- Background Light: `#f6f7f8`
- Background Dark: `#101922`

### Adding New Components
1. Create component in `/components` directory
2. Add TypeScript interfaces in `/types`
3. Import and use in dashboard page

## Future Enhancements

- Backend API integration
- Real-time data updates
- Advanced patient management
- Appointment scheduling
- Medical records integration
- Notification system
- Multi-language support

## License

This project is for educational and demonstration purposes.