# CAS LMS

A modern Learning Management System (LMS) front-end built with React, TypeScript, Vite, and Tailwind CSS.

## Overview

This project is a client-side LMS prototype with routing, dashboard layouts, authentication context, theme switching, notifications, and mock API support via `json-server`.

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Axios
- Lucide React icons
- JSON Server for local mock data
- Concurrently for launching frontend + mock backend together

## Project Structure

- `src/`
  - `App.tsx` - Main application entrypoint and router configuration.
  - `main.tsx` - React DOM bootstrap and global CSS import.
  - `index.css` - Tailwind directives, global styles, theme utilities, and custom UI styles.
  - `pages/` - Route pages for landing, login, forgot password, team and dashboard sections.
    - `dashboard/` - Dashboard views for admins, teachers, students, and feature pages.
  - `layouts/` - `DashboardLayout.tsx` provides the main dashboard shell for nested routes.
  - `context/` - Application context providers for authentication, theme, and notifications.
  - `components/` - Shared UI components such as `NotificationsPanel`.
  - `services/` - `api.ts` should contain API helper functions and Axios configuration.

- `db.json` - Local mock data store used by `json-server`.
- `package.json` - Dependency list and development scripts.
- `vite.config.ts` - Vite configuration with React plugin and alias setup.
- `tailwind.config.js` - Tailwind content paths, theme extensions, custom colors, animations, and dark mode.

## Key Features

- Client-side routing using `react-router-dom`
- Nested dashboard routes under `/dashboard`
- Context-based auth, theme, and notification state management
- Tailwind-driven utility styling with custom themes and animation utilities
- Mock backend support with `json-server`
- Local development script to run both frontend and backend concurrently

## Available Scripts

From the project root, run:

- `npm install` - Install dependencies
- `npm run dev` - Start Vite development server
- `npm run build` - Build the app for production (`tsc -b && vite build`)
- `npm run preview` - Preview the production build locally
- `npm run server` - Start local mock API server on `http://localhost:3001`
- `npm run dev:all` - Start both `json-server` and Vite together

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the mock backend and frontend together:

```bash
npm run dev:all
```

3. Open the app in your browser at the URL shown by Vite, usually `http://localhost:5173`.

4. If needed, access the mock API at `http://localhost:3001`.

## Notes

- `tailwind.config.js` extends the default theme with custom `primary` and `dark` color palettes, animations, and keyframes.
- `vite.config.ts` adds an import alias `@` that resolves to `./src`.
- The app expects a `root` DOM element in `index.html` and imports global styles via `src/index.css`.

## Recommended Next Steps

- Implement `services/api.ts` for real backend integration.
- Expand `db.json` with matching resources for users, courses, messages, and enrollments.
- Add authentication guards and protected route handling.
- Add unit/integration tests for critical pages and context providers.
