# AgileTrack Pro - Environment Setup & Configuration

**Last Updated**: December 13, 2024  
**Environment**: Development Ready, Production Pending

## 🔧 Local Development Setup

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **PostgreSQL**: v15.0 or higher
- **Git**: For version control

### **Environment Variables Required**

Create `.env.local` file in project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/agiletrack_dev"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Auth Providers (Configure as needed)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"  
GITHUB_CLIENT_SECRET="your-github-client-secret"

# File Upload (Future)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Optional: Development flags
NODE_ENV="development"
```

### **Database Setup Steps**

#### **1. PostgreSQL Installation**
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### **2. Database Creation**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE agiletrack_dev;

-- Create user (optional)
CREATE USER agiletrack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agiletrack_dev TO agiletrack_user;
```

#### **3. Prisma Setup**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed database with sample data
npx prisma db seed
```

### **Installation Steps**

```bash
# 1. Clone repository
git clone [repository-url]
cd agiletracker

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev

# Application will be available at http://localhost:3000
```

## 📦 Dependencies Installed

### **Core Dependencies**
```json
{
  "next": "14.0.4",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "typescript": "5.3.3"
}
```

### **Authentication & Security**
```json
{
  "next-auth": "5.0.0-beta.4",
  "@auth/prisma-adapter": "1.0.9",
  "zod": "3.22.4"
}
```

### **Database & ORM**
```json
{
  "prisma": "5.7.1",
  "@prisma/client": "5.7.1"
}
```

### **UI & Styling**
```json
{
  "tailwindcss": "3.3.6",
  "framer-motion": "10.16.16",
  "lucide-react": "0.294.0",
  "recharts": "2.8.0",
  "@radix-ui/react-dropdown-menu": "2.0.6",
  "@radix-ui/react-select": "2.0.0",
  "@radix-ui/react-toast": "1.1.5"
}
```

### **Development Tools**
```json
{
  "eslint": "8.55.0",
  "eslint-config-next": "14.0.4",
  "@types/node": "20.10.4",
  "@types/react": "18.2.45",
  "@types/react-dom": "18.2.18"
}
```

## 🗄️ Database Configuration

### **Prisma Schema Location**
`prisma/schema.prisma`

### **Current Migration Status**
- ✅ **Users table**: Complete with authentication fields
- ✅ **Organizations table**: Multi-tenant structure
- ✅ **OrganizationMembers table**: Role-based membership
- ✅ **Projects table**: Project management structure
- ✅ **Tasks table**: Complete task management with hierarchy
- ✅ **Relationships**: All foreign keys and constraints

### **Database Indexes (Recommended)**
```sql
-- Performance optimization indexes (to be added)
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_organization_members_user_org ON organization_members(user_id, organization_id);
```

### **Sample Data Seeding**
```typescript
// prisma/seed.ts (to be created)
const sampleOrg = await prisma.organization.create({
  data: {
    name: "Sample Organization",
    slug: "sample-org",
    settings: {}
  }
})

const sampleProject = await prisma.project.create({
  data: {
    name: "Sample Project",
    organizationId: sampleOrg.id,
    methodology: "AGILE",
    status: "ACTIVE"
  }
})
```

## 🌐 Development Server Configuration

### **Next.js Configuration** (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cloudinary.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

### **TypeScript Configuration** (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **Tailwind Configuration** (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
}
```

## 🚀 Build & Deployment Configuration

### **Development Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed"
  }
}
```

### **Production Environment Variables**
```bash
# Production .env
DATABASE_URL="postgresql://user:pass@prod-host:5432/agiletrack_prod"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"

# Optional production settings
NODE_ENV="production"
```

### **Docker Configuration** (Planned)
```dockerfile
# Dockerfile (to be created)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### **Database Migration Strategy**
```bash
# Development
npx prisma db push  # For development/prototyping

# Production
npx prisma migrate dev --name init  # Create migration
npx prisma migrate deploy  # Apply to production
```

## 🔒 Security Configuration

### **Environment Security**
- ✅ Environment variables properly configured
- ✅ Database credentials secured
- ✅ NextAuth secret key implemented
- ⚠️ **TODO**: Add rate limiting configuration
- ⚠️ **TODO**: Add CORS configuration for production

### **Authentication Setup**

#### **NextAuth Configuration** (`src/lib/auth.ts`)
```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
}
```

### **Database Security**
- ✅ Connection string encryption
- ✅ Query parameterization via Prisma
- ⚠️ **TODO**: Add connection pooling for production
- ⚠️ **TODO**: Add read replicas configuration

## 🧪 Testing Configuration

### **Jest Configuration** (To be added)
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### **Testing Database**
```bash
# Separate test database
DATABASE_URL="postgresql://username:password@localhost:5432/agiletrack_test"
```

## 🔧 IDE Configuration

### **VS Code Settings** (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### **Recommended Extensions**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prisma
- TypeScript Importer
- GitLens
- Auto Rename Tag

## 📊 Performance Monitoring

### **Development Tools**
```bash
# Bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Performance monitoring
npm install --save-dev webpack-bundle-analyzer
```

### **Production Monitoring** (Planned)
- **Vercel Analytics**: For Next.js performance monitoring
- **Sentry**: For error tracking and performance monitoring
- **PostgreSQL monitoring**: Connection pool and query performance

## 🚨 Troubleshooting Common Issues

### **Database Connection Issues**
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l

# Test connection
psql $DATABASE_URL
```

### **Prisma Issues**
```bash
# Reset database (development only)
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Check schema
npx prisma validate
```

### **Next.js Issues**
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📋 Deployment Checklist

### **Pre-deployment**
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build passes successfully
- [ ] Tests pass (when implemented)
- [ ] Security review completed

### **Production Setup**
- [ ] SSL certificate configured
- [ ] Database backups scheduled
- [ ] Monitoring alerts set up
- [ ] Error tracking configured
- [ ] Performance monitoring active

---

**Setup Status**: Development environment fully configured and operational. Production deployment configuration pending.
