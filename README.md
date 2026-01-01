# MindFlow

A sleek, professional mind mapping tool featuring an infinite canvas, custom node editing, and instant structural templates.

> **🚀 Quick Start:** New to Supabase? Get up and running in 5 minutes with [QUICK_START.md](./QUICK_START.md)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Supabase:
   ```bash
   # Quick setup (interactive)
   npm run setup
   
   # Or manual setup
   cp .env.example .env
   # Then edit .env with your Supabase credentials
   ```
   
   **Note:** This app uses Supabase for authentication. See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.
   
3. Verify configuration:
   ```bash
   npm run setup:check
   ```

4. Run database migration:
   ```bash
   npm run db:migrate:supabase
   ```

5. Start the development server:
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Start development server (handles both frontend and API routes)
   npm run dev
   ```
   
   **Note:** For local development, use `npm run dev` which runs `vercel dev`. This is required because the API routes are Vercel serverless functions. If you only want to run the frontend without API routes, use `npm run dev:vite`.

## Features
- **Infinite Canvas**: Built with React Flow.
- **Custom Nodes**: Nodes support images, links, notes, and rich styling.
- **Auto-Layout**: Intelligent branching logic for child nodes.
- **Templates**: Brainstorming, Hierarchy, and Process templates.
- **Export**: Save maps as PNG.
- **Dark Mode**: Fully supported.

## Architecture
- **src/components**: React components (Canvas, Nodes, Edges, Toolbar).
- **src/store**: Global state management via Zustand.
- **src/types**: TypeScript definitions.
- **src/utils**: Helper functions.
- **src/lib/api.ts**: API client for database operations.
- **api/**: Vercel Serverless Functions for backend API.

## Database & API

The app includes a PostgreSQL database backend for persisting mind maps.

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com) or use an existing PostgreSQL database
2. Run the schema migration:
   ```bash
   psql $DATABASE_URL -f database/schema.sql
   ```
3. If migrating from custom auth to Supabase, run:
   ```bash
   psql $DATABASE_URL -f database/supabase_migration.sql
   ```
4. Set the required environment variables in your `.env` file (see SUPABASE_MIGRATION.md)

### API Endpoints

- `GET /api/mindmaps` - List all mind maps
- `GET /api/mindmaps/[id]` - Get a specific mind map with nodes and edges
- `POST /api/mindmaps` - Create a new mind map
- `PUT /api/mindmaps/[id]` - Update a mind map
- `POST /api/mindmaps/[id]/save` - Save nodes and edges for a mind map
- `DELETE /api/mindmaps/[id]` - Delete a mind map

### Using the API in Your Code

```typescript
import { useMindMapStore } from './store/useMindMapStore';

// Create a new mind map
const mindMapId = await useMindMapStore.getState().createNewMindMap('My Map');

// Save current state
await useMindMapStore.getState().saveToDatabase(mindMapId);

// Load a mind map
await useMindMapStore.getState().loadFromDatabase(mindMapId);
```

## Deployment

### Deploy to Vercel

This app is ready to deploy to Vercel with zero configuration:

1. **Using Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Using GitHub Integration**:
   - Push your code to GitHub
   - Import your repository in [Vercel](https://vercel.com)
   - Vercel will automatically detect it's a Vite project and configure it

3. **Manual Deployment**:
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your Git repository
   - Vercel will automatically:
     - Detect the Vite framework
     - Set build command: `npm run build`
     - Set output directory: `dist`
     - Configure routing for SPA

The app includes a `vercel.json` configuration file for optimal deployment settings.

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.
