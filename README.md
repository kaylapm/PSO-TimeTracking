# Ardine

Beta v0.1.0

A modern, full-featured time tracking and project management platform built with Next.js and PostgreSQL.

> **⚠️ Beta Software Notice**
> Ardine is currently in beta (v0.1.0) and has some quirks. Most notably, **email sending is not yet implemented**. Team invitations and user onboarding work via shareable invite links instead of automated emails. See [Known Limitations](#known-limitations) for details.

---

# Fork Information

This repository is forked and developed by **Kelompok 5 PSO A** for the PSO course assignment based on the original Ardine project.

## Team Members

- Nicholas Evan Sitanggang (5026231146)
- Kayla Nathania (5026231151)
- Kayla Putri Maharani (5026231158)
- Tahhiyah Muhfimah (5026231170)

## Project Presentation

Canva Presentation:  
https://canva.link/ardinepso-kelompok5

---

## Overview

Ardine is a comprehensive solution for freelancers and small teams to manage their time, projects, clients, and invoicing. It provides a clean, intuitive interface for tracking billable hours, managing project budgets, and generating professional invoices.

## Features

### Core Features

- **Time Tracking** - Start/stop timers, manual time entry, and detailed time logs
- **Project Management** - Organize work by projects and tasks with custom statuses
- **Client Management** - Track client information, billing rates, and contact details
- **Team Collaboration** - Multi-user support with role-based permissions
- **Invoicing** - Generate and manage invoices with PDF export
- **Budget Tracking** - Set and monitor project budgets (hours or amount-based)
- **Reporting** - Dashboard with revenue analytics and time summaries

### Advanced Features

- **Multi-level Pricing** - Hourly rates at client, project, and task levels
- **Team Workspaces** - Isolated data spaces for different organizations
- **Role-Based Access Control** - Instance, team, and project-level permissions
- **GraphQL API** - Modern API for flexible data queries

## Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Re-usable component library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL 17** - Primary database
- **GraphQL** - Query language with Pothos Schema Builder
- **JWT** - Token-based authentication

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Prerequisites

### For Local Development

- Node.js 20.x or higher
- PostgreSQL 15+ (or use Docker)
- npm or yarn

### For Docker Deployment

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start (Docker)

The fastest way to get Ardine up and running:

```bash
# 1. Clone the repository
git clone https://github.com/ardinehq/ardine.git
cd ardine

# 2. Set up environment variables
cp .env.example .env
nano .env  # Edit with your secure passwords

# 3. Start with Docker Compose
docker-compose up -d

# 4. Access the application
# Open http://localhost:3000 in your browser
```

The first registered user will automatically be assigned the ADMIN role.

For detailed Docker instructions, see [DOCKER_README.md](./DOCKER_README.md).

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

#### Option A: Use Docker for Database Only

```bash
docker run -d \
  --name ardine-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ardine \
  -p 5432:5432 \
  postgres:17-alpine
```

#### Option B: Use Local PostgreSQL

Ensure PostgreSQL is installed and running, then create the database:

```bash
createdb ardine
```

### 3. Initialize Database Schema

```bash
psql -U postgres -d ardine -f ardine_ddl.sql
```

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ardine
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Application
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable            | Description           | Default                |
| ------------------- | --------------------- | ---------------------- |
| `POSTGRES_USER`     | Database user         | `postgres`             |
| `POSTGRES_PASSWORD` | Database password     | `postgres`             |
| `POSTGRES_DB`       | Database name         | `ardine`               |
| `POSTGRES_HOST`     | Database host         | `localhost`            |
| `POSTGRES_PORT`     | Database port         | `5432`                 |
| `JWT_SECRET`        | Secret for JWT tokens | Required in production |
| `NODE_ENV`          | Environment mode      | `development`          |

⚠️ **Security Note**: Always use strong, unique values for `POSTGRES_PASSWORD` and `JWT_SECRET` in production!

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

### Code Generation (GraphQL)

```bash
npm run codegen
```

## Common Tasks

### Creating a New User (Admin)

1. Navigate to `/admin/users`
2. Users can self-register via `/register`
3. First user automatically becomes ADMIN

### Inviting Users to a Team

Since email sending is not yet implemented, team invitations work via shareable links.

### Setting Up a Team

1. Register as the first user
2. Create a team
3. Invite team members using invite links

### Creating Invoices

1. Track billable time
2. Navigate to Invoices
3. Create and manage invoices

## Known Limitations

### No Email Sending (Currently)

Ardine does not currently send automated emails.

Affected features:

- Team Invitations
- Password Resets
- Notifications

## Deployment

### Production Checklist

- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Generate secure `JWT_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Configure backups
- [ ] Enable SSL/TLS
- [ ] Configure reverse proxy
- [ ] Set up monitoring

## Troubleshooting

### Database Connection Issues

```bash
docker-compose ps
```

### Build Errors

```bash
rm -rf .next node_modules && npm install
```

### Authentication Issues

- Verify `JWT_SECRET`
- Clear cookies
- Retry login

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push changes
5. Open Pull Request

## Security

### Security Features

- bcrypt password hashing
- HTTP-only JWT cookies
- SQL injection protection
- Role-based access control

## License

MIT License. See [LICENSE](./LICENSE) for details.

## Support

For issues and questions:

- Open an issue on GitHub
- Check `DOCKER_README.md`

## Roadmap

### Priority Features

- Email Support
- Better Onboarding
- Mobile UI Improvements

### Future Enhancements

- Real-time collaboration
- Mobile apps
- Advanced analytics
- Third-party integrations

## Acknowledgments

Built with:

- Next.js
- React
- PostgreSQL
- Tailwind CSS
- Shadcn/ui
- Pothos GraphQL

---

Made with ❤️ by Blake Stevenson
