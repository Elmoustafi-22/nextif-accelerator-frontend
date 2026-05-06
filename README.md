# NextIF Ambassadors Frontend

The Ambassador Portal for the NextIF Ambassador Platform. This application is designed for ambassadors to view tasks, submit work, track their progress, and view their dashboard.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Animations:** Framer Motion

## Core Features

- **Personalised Dashboard:** Track XP progress, recent activities, and pending tasks.
- **Enhanced Task View:**
  - View all assigned tasks including Weekly, Monthly, and **ADHOC** assignments.
  - **Actionable Feedback:** Direct visibility into admin remarks for redo requests.
  - **Dynamic Deadlines:** Real-time countdowns that adapt to individual redo deadlines.
- **Events & Attendance:**
  - View upcoming events with join links (Zoom/Meet, etc.).
  - Track personal attendance history for workshops and webinars.
- **Secure Submissions:** Structured responses with support for file attachments and links.
- **Profile Management:** Update personal information and account security.
- **Communication:** Submit complaints and inquiries directly to the admin team.

- Node.js (v18 or higher recommended)
- npm

## Installation

1. Navigate to the project directory:

   ```bash
   cd nextif-ambassadors-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server with hot reload:

```bash
npm run dev
```

The application will be available at usually `http://localhost:5173` (or the next available port).

## Building for Production

To build the application for production:

```bash
npm run build
```

This will generate the static assets in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Linting

To run the linter:

```bash
npm run lint
```
