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
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
>>>>>>> medical-dashboard-nextjs
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