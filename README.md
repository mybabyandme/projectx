# AgileTrack Pro - Enterprise Project Management Platform

A modern, full-stack web application that bridges agile and traditional project management methodologies. Built with Next.js 14, TypeScript, and PostgreSQL.

## 🚀 Features

- **Multi-Tenant Architecture**: Organization-based data segregation
- **Role-Based Access Control**: Granular permissions for different user roles
- **Multi-Methodology Support**: Agile (Kanban, Sprints) and Traditional (Gantt, WBS)
- **Enterprise Security**: JWT authentication, audit trails, compliance features
- **Financial Management**: Budget tracking, approval workflows, expense categorization
- **Progress Reporting**: Comprehensive reporting with charts and analytics

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 15+
- **Authentication**: NextAuth.js v5 with JWT
- **File Storage**: Cloudinary
- **UI Components**: Radix UI primitives
- **Validation**: Zod schemas

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Cloudinary account (optional, for file uploads)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agiletrack-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/agiletrack_pro"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional OAuth providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Optional Cloudinary for file uploads
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Optional: Seed the database
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.
## 🏗 Project Structure

```
/agiletrack-pro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── [orgSlug]/         # Organization-scoped routes
│   ├── components/            # Reusable React components
│   │   ├── ui/                # Base UI components
│   │   ├── auth/              # Authentication components
│   │   ├── forms/             # Form components
│   │   └── project/           # Project-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication configuration
│   │   ├── db.ts              # Database utilities
│   │   ├── cloudinary.ts      # File upload utilities
│   │   └── utils.ts           # General utilities
│   ├── types/                 # TypeScript type definitions
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 👥 User Roles & Permissions

- **Super Admin**: Platform administration
- **Organization Admin**: Full organization management
- **Donor/Sponsor**: Funding oversight and approval
- **Project Manager**: Project planning and execution
- **Monitor**: Progress tracking and reporting
- **Team Member**: Task execution and collaboration
- **Viewer**: Read-only access

## 🔄 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Test**
   ```bash
   npm run type-check  # TypeScript validation
   npm run lint        # Code linting
   ```

3. **Database Changes**
   ```bash
   npm run db:migrate  # Create and apply migrations
   npm run db:studio   # Browse database in Prisma Studio
   ```

## 🚀 Deployment

The application is designed to be deployed on platforms like Vercel, Netlify, or any Node.js hosting service.

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Database Deployment

Use services like:
- **Neon**: Serverless PostgreSQL
- **Supabase**: Open source Firebase alternative
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Enterprise PostgreSQL

## 📖 API Documentation

API routes follow RESTful conventions and are organized by resource:

- `/api/auth/*` - Authentication endpoints
- `/api/organizations/*` - Organization management
- `/api/projects/*` - Project management
- `/api/tasks/*` - Task management
- `/api/reports/*` - Progress reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**AgileTrack Pro** - Bridging Agile and Traditional Project Management