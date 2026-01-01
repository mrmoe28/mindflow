# MindFlow

A sleek, professional mind mapping tool featuring an infinite canvas, custom node editing, and instant structural templates.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Add your Google API Key if required for specific features
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

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
