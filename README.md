# Service Desk Lite

A lightweight internal ticketing system built with Azure Functions and React.

## Project Structure

```
├── backend/          # Azure Functions API
│   ├── src/
│   │   ├── functions/
│   │   │   ├── tickets/      # Ticket CRUD operations
│   │   │   ├── comments/     # Comment operations
│   │   │   └── activities/   # Activity/audit log
│   │   └── shared/           # Shared utilities
│   ├── host.json
│   ├── local.settings.json
│   └── package.json
│
├── frontend/         # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.jsx
│   └── package.json
│
└── package.json      # Root scripts
```

## Features

- **Ticket Management**: Create, view, update, and delete tickets
- **Comments**: Add comments to tickets for collaboration
- **Activity Logging**: Automatic audit trail of all changes
- **Filtering**: Filter tickets by status and priority
- **Modern UI**: Dark theme with beautiful design

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4`)
- Azure CLI (for deployment)

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Local Development

1. **Start Azurite** (Azure Storage Emulator):
   ```bash
   npm run start:azurite
   ```

2. **Start the Backend** (in another terminal):
   ```bash
   npm run start:backend
   ```

3. **Start the Frontend** (in another terminal):
   ```bash
   npm run start:frontend
   ```

4. Open http://localhost:5173 in your browser

### Deployment

```bash
# Deploy backend to Azure
npm run deploy:backend
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tickets | Create ticket |
| GET | /api/tickets | List all tickets |
| GET | /api/tickets/:id | Get ticket |
| PATCH | /api/tickets/:id | Update ticket |
| DELETE | /api/tickets/:id | Delete ticket |
| POST | /api/tickets/:id/comments | Add comment |
| GET | /api/tickets/:id/comments | List comments |
| DELETE | /api/tickets/:id/comments/:commentId | Delete comment |
| GET | /api/tickets/:id/activities | Get activity log |

## Tech Stack

- **Backend**: Azure Functions (Node.js v4 model)
- **Database**: Azure Table Storage
- **Frontend**: React + Vite
- **HTTP Client**: Axios

