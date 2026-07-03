# SkyTechDS Admin Panel

Frontend application for the SkyTechDS website admin dashboard. Built with React, TypeScript, and Vite, it connects to a backend API to manage site content (blogs, services, portfolio, translations, etc.).

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — build and dev server
- **Tailwind CSS 4** — styling
- **React Router 7** — page navigation
- **shadcn/ui** components (`src/components/ui`)

## Setup

```bash
npm install
```

Create a `.env` file in the project root (example):

```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=MyReactApp
```

## Running

```bash
npm run dev       # development server
npm run build     # production build
npm run preview   # locally preview the build
npm run lint      # run ESLint
```

## Project Structure

```
src/
├── components/       # Shared components (Header, Sidebar, cards, etc.)
│   └── ui/           # shadcn/ui-based UI components
├── contexts/         # AuthContext — authentication state
├── layouts/           # DashboardLayout — main panel layout
├── pages/            # Pages grouped by module (Index/Create/Update)
├── App.tsx           # Route definitions
└── main.tsx          # Application entry point
```

## Modules

The panel consists of Index/Create/Update pages for managing the following sections:

- Languages, phones, emails, maps, addresses, social networks
- Contact messages
- Dictionaries and translations
- About, site info, global SEO
- Blog categories, blogs, tags
- Services, portfolio, testimonials, FAQ, statistics, pages
- Admin section: users, roles, and permissions

## Authentication

Login is handled via the `/login` route through `AuthContext`. All other routes are protected by `ProtectedRoute` — without a valid token, the user is automatically redirected to `/login`.
