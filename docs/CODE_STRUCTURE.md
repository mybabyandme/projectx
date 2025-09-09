**Project Creation API Features**:
- Complete wizard data validation
- Template-based phase generation
- Deliverable-to-task conversion
- Budget initialization
- Stakeholder data storage in project metadata
- Risk assessment data persistence
- Comprehensive error handling and rollback

---

## ⚙️ **Configuration Files**

### **`package.json`** ✅ UPDATED
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",  // ✅ FIXED - Prisma generation
    "start": "next start",
    "postinstall": "prisma generate"           // ✅ ADDED - Auto-generation
  }
}
```

### **`vercel.json`** ✅ NEW
```json
{
  "buildCommand": "prisma generate && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### **`next.config.js`**
```javascript
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'avatars.githubusercontent.com']
  }
}
```

---

## 🎨 **Design System Architecture**

### **Color System**
```typescript
// Consistent role-based colors
const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ORG_ADMIN: 'bg-red-100 text-red-800',
  PROJECT_MANAGER: 'bg-blue-100 text-blue-800',
  MONITOR: 'bg-green-100 text-green-800',
  DONOR_SPONSOR: 'bg-yellow-100 text-yellow-800',
  TEAM_MEMBER: 'bg-gray-100 text-gray-800',
  VIEWER: 'bg-gray-100 text-gray-600'
}

// Risk level colors
const RISK_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300'
}
```

### **Component Patterns**
```typescript
// Standard layout pattern
<div className="p-6 space-y-6">
  <StatsHeader title="..." subtitle="..." stats={...} actions={...} />
  <SearchFilters searchQuery={...} filters={...} sortOptions={...} />
  <ResultsList items={...} fields={...} actions={...} />
</div>

// Professional modal pattern
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
    {/* Header with icon and close button */}
    {/* Content with form sections */}
    {/* Footer with actions */}
  </div>
</div>
```

---

## 📊 **Data Flow Architecture**

### **Wizard Data Flow**
```
1. User Input → Form Component
2. Form Validation → Zod Schema
3. State Update → React State + localStorage
4. Step Navigation → Validation Check
5. Final Submission → API Endpoint
6. Database Storage → Project + Related Tables
```

### **Project Creation Flow**
```
Wizard Data → API Validation → Database Transaction:
├── Create Project Record
├── Generate Template Phases
├── Convert Deliverables → Tasks
├── Initialize Budget
└── Store Metadata (Charter, Stakeholders, Risks)
```

### **Authentication Flow**
```
User Request → NextAuth.js → Database Session → Organization Check → Permission Validation → Component Render
```

---

## 🔐 **Security Architecture**

### **Authentication & Authorization**
```typescript
// Multi-layer security
1. NextAuth.js Session Management
2. Organization Membership Validation
3. Role-Based Permission Checks
4. API Route Protection
5. Database Row-Level Security (planned)
```

### **Data Validation**
```typescript
// Input validation layers
1. Client-side: Zod Schema Validation
2. API-side: Request Body Validation
3. Database: Schema Constraints
4. UI: Real-time Feedback
```

---

## 📱 **Responsive Design Architecture**

### **Breakpoint Strategy**
```css
/* Mobile-first approach */
sm: '640px'   /* Tablet */
md: '768px'   /* Small desktop */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Large desktop */
```

### **Component Responsiveness**
```typescript
// Standard responsive patterns
grid-cols-1 md:grid-cols-2 lg:grid-cols-3     // Grid layouts
flex-col md:flex-row                          // Flex direction
hidden md:block                               // Conditional display
p-4 md:p-6 lg:p-8                            // Responsive spacing
```

---

## 🔧 **Performance Architecture**

### **Component Optimization Strategies**
1. **Lazy Loading**: Wizard steps load on demand
2. **Memoization**: React.memo for expensive components (planned)
3. **Debouncing**: Auto-save with 30-second debounce
4. **Optimistic Updates**: Immediate UI feedback

### **Bundle Optimization**
1. **Tree Shaking**: Lucide React icons imported individually
2. **Code Splitting**: Route-based splitting with Next.js
3. **Image Optimization**: Next.js Image component
4. **CSS Optimization**: Tailwind CSS purging

---

## 🧪 **Testing Architecture**

### **Testing Strategy** (Planned)
```
├── Unit Tests
│   ├── Component rendering
│   ├── Form validation
│   ├── Utility functions
│   └── Schema validation
├── Integration Tests
│   ├── API endpoints
│   ├── Database operations
│   ├── Authentication flow
│   └── Wizard completion
└── E2E Tests
    ├── User journeys
    ├── Cross-browser compatibility
    └── Mobile responsiveness
```

---

## 📦 **State Management Architecture**

### **Wizard State Management**
```typescript
// Multi-layer state management
1. React useState: Form state within components
2. localStorage: Auto-save persistence
3. Parent State: Wizard-level data aggregation
4. API State: Server synchronization
```

### **Global State Strategy**
```typescript
// Current: React Context + localStorage
// Future: Consider Redux Toolkit for complex state
// Server State: React Query/SWR for API caching
```

---

## 🔗 **Integration Points**

### **External Services**
- **Cloudinary**: File upload and media management
- **NextAuth.js**: Authentication providers
- **Vercel**: Deployment and hosting
- **PostgreSQL**: Primary database

### **Internal Integrations**
- **Prisma ORM**: Database abstraction
- **Zod**: Schema validation
- **Tailwind CSS**: Styling system
- **Lucide React**: Icon library

---

## 🚀 **Deployment Architecture**

### **Vercel Configuration**
```json
// Optimized for Next.js deployment
{
  "buildCommand": "prisma generate && npm run build",
  "framework": "nextjs",
  "environmentVariables": {
    "DATABASE_URL": "Required",
    "NEXTAUTH_SECRET": "Required",
    "NEXTAUTH_URL": "Auto-detected"
  }
}
```

### **Environment Strategy**
```
Development → Staging → Production
├── Local database (PostgreSQL)
├── Development environment variables
├── Staging deployment (Vercel Preview)
└── Production deployment (Vercel)
```

---

## 📈 **Scalability Considerations**

### **Database Scaling**
- **Horizontal Partitioning**: By organization_id
- **Indexing Strategy**: Optimized for multi-tenant queries
- **Connection Pooling**: Prisma connection management
- **Caching Layer**: Redis for session/frequently accessed data (planned)

### **Application Scaling**
- **Serverless Functions**: Next.js API routes on Vercel
- **CDN Integration**: Static asset optimization
- **Code Splitting**: Route-based and component-based
- **Database Optimization**: Query optimization and indexing

---

## 🎯 **Architecture Decisions & Rationale**

### **Key Architectural Choices**

1. **Next.js App Router**
   - **Decision**: Use Next.js 14 with App Router
   - **Rationale**: Server Components, improved performance, modern React patterns
   - **Impact**: Better SEO, faster initial loads, simplified routing

2. **Multi-Tenant Architecture**
   - **Decision**: Organization-scoped data isolation
   - **Rationale**: Enterprise requirement for data segregation
   - **Implementation**: Every query filtered by organization_id

3. **Prisma ORM**
   - **Decision**: Use Prisma for database management
   - **Rationale**: Type safety, excellent Next.js integration, migrations
   - **Impact**: Faster development, fewer SQL errors, better maintainability

4. **Zod Validation**
   - **Decision**: Schema-first validation with Zod
   - **Rationale**: Type safety, client/server validation, excellent TypeScript integration
   - **Impact**: Consistent validation, better error handling, reduced bugs

5. **Component-Based Architecture**
   - **Decision**: Modular component design with clear separation
   - **Rationale**: Reusability, maintainability, testability
   - **Implementation**: Layout components, feature components, UI components

---

## 🔄 **Data Models & Relationships**

### **Entity Relationships**
```
Organization (1) ─── (many) OrganizationMembers ─── (1) User
     │
     └── (many) Projects ─── (many) ProjectPhases
             │
             ├── (many) Tasks
             ├── (many) ProjectBudgets
             └── (1) Metadata {
                   charter: ProjectCharter,
                   stakeholders: StakeholderData,
                   risks: RiskAssessment
                 }
```

### **Wizard Data Structure**
```typescript
interface ProjectWizardData {
  basics: {
    name, description, template, methodology,
    priority, budget, currency, dates, tags
  },
  charter: {
    vision, objectives, scope, outOfScope,
    deliverables, assumptions, constraints, successCriteria
  },
  stakeholders: {
    stakeholders: [{
      id, name, email, role, organization,
      influence, interest, responsibilities, contactInfo
    }]
  },
  risks: {
    risks: [{
      id, title, description, category,
      impact, probability, mitigation, contingency,
      owner, dueDate, status
    }]
  }
}
```

---

## 📋 **Component Dependencies**

### **Wizard Component Dependencies**
```
project-wizard-view
├── project-basics-form
├── project-charter-form
├── stakeholder-matrix
├── risk-assessment
└── project-summary
    └── All wizard data for final review
```

### **UI Component Dependencies**
```
All Components
├── @/components/ui/button
├── @/components/ui/input
├── @/components/ui/textarea
├── @/components/ui/label
└── @/components/ui/use-toast
```

### **Library Dependencies**
```
Core Framework
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
└── Tailwind CSS

Validation & Forms
├── Zod (schema validation)
├── React Hook Form (planned)
└── Custom form handling

Database & Auth
├── Prisma ORM
├── NextAuth.js v5
├── PostgreSQL
└── bcryptjs

UI & Icons
├── Lucide React
├── Framer Motion
├── Tailwind CSS
└── Custom components
```

---

**✅ ARCHITECTURE STATUS: SOLID FOUNDATION WITH CLEAR SCALING PATH**

*This architecture supports the current feature set while providing clear patterns for future expansion. The modular design allows for independent development of new features while maintaining consistency across the application.*- `tailwindcss` - Utility-first CSS framework
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `recharts` - Data visualization library

### **Form & Validation**
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation integration

### **Development Tools**
- `eslint` - Code linting
- `prettier` - Code formatting
- `@types/*` - TypeScript definitions

## 🎯 Component Responsibilities

### **Data Flow Architecture**

#### **Server Components** (Pages)
```typescript
// Pages fetch data and pass to client components
[orgSlug]/tasks/page.tsx -> MyTasksView (client)
[orgSlug]/tasks/[taskId]/page.tsx -> TaskDetailView (client)
[orgSlug]/team/page.tsx -> TeamManagementView (client)
```

#### **Client Components** (Interactive)
```typescript
// Handle user interactions and local state
MyTasksView: filtering, search, navigation
TaskDetailView: editing, comments, status updates
TeamManagementView: member management, role updates
```

#### **API Integration Pattern**
```typescript
// Client components make direct API calls
const handleUpdate = async () => {
  const response = await fetch(`/api/organizations/${orgSlug}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
  // Handle response and update local state
}
```

### **State Management Strategy**

#### **Local State** (useState)
- Form inputs and editing states
- UI toggles (modals, dropdowns)
- Loading and error states
- Local filters and search

#### **Server State** (Props from Server Components)
- Initial data fetching
- Authentication context
- Organization and user data

#### **Global State** (Context - Future)
- User preferences
- Theme settings
- Notification state

## 🔒 Security Implementation

### **Authentication Layer**
```typescript
// Route protection in layout
const session = await auth()
if (!session?.user?.id) {
  notFound()
}

// Organization membership validation
const membership = await db.organizationMember.findFirst({
  where: {
    userId: session.user.id,
    organization: { slug: params.orgSlug }
  }
})
```

### **Authorization Patterns**
```typescript
// Role-based component rendering
{canEdit && (
  <Button onClick={handleEdit}>Edit</Button>
)}

// API permission checking
const canEdit = ['ORG_ADMIN', 'PROJECT_MANAGER'].includes(userRole) ||
               task.assigneeId === userId
```

### **Data Validation**
```typescript
// Zod schemas for API validation
const updateTaskSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  // ... other fields
})
```

## 📱 Mobile Optimization Strategy

### **Responsive Design Patterns**

#### **Progressive Disclosure**
```typescript
// Show essential info on mobile, expand on desktop
<div className="block sm:hidden">Mobile content</div>
<div className="hidden sm:block">Desktop content</div>
```

#### **Touch-Friendly Interactions**
```typescript
// Minimum 44px touch targets
className="h-11 px-4" // 44px height
// Generous spacing for fat fingers
className="space-y-3" // 12px vertical spacing
```

#### **Adaptive Layouts**
```typescript
// Stack on mobile, side-by-side on desktop
className="flex flex-col lg:flex-row gap-4"
// Grid responsive breakpoints  
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## 🧪 Testing Strategy (To Be Implemented)

### **Unit Tests**
```typescript
// Component testing with React Testing Library
describe('TaskDetailView', () => {
  it('should render task information', () => {
    render(<TaskDetailView task={mockTask} />)
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
  })
})
```

### **Integration Tests**
```typescript
// API endpoint testing
describe('/api/organizations/[orgSlug]/tasks/[taskId]', () => {
  it('should update task when user has permission', async () => {
    const response = await PATCH('/api/...', updateData)
    expect(response.status).toBe(200)
  })
})
```

### **E2E Tests**
```typescript
// Critical user flows with Playwright
test('User can create and complete a task', async ({ page }) => {
  await page.goto('/org/tasks')
  await page.click('[data-testid=create-task]')
  // ... test flow
})
```

## 🚀 Performance Optimizations

### **Implemented**
- **Component optimization**: Proper React.memo usage
- **Bundle optimization**: Dynamic imports for heavy components
- **Image optimization**: Next.js Image component usage
- **Database optimization**: Selective field queries

### **Planned**
- **Virtual scrolling**: For large datasets in ResultsList
- **Caching**: Redis for frequently accessed data
- **CDN**: Static asset delivery optimization
- **Lazy loading**: Route-based code splitting

## 📊 Monitoring & Analytics

### **Performance Monitoring**
- **Core Web Vitals**: FCP, LCP, CLS tracking
- **Bundle analysis**: webpack-bundle-analyzer
- **Database performance**: Query optimization tracking

### **User Analytics**
- **Usage patterns**: Feature adoption tracking
- **Error monitoring**: Sentry integration planned
- **Performance metrics**: Real user monitoring

## 🔄 Development Workflow

### **Git Strategy**
```bash
main branch: Production-ready code
develop branch: Integration branch
feature/* branches: Feature development
hotfix/* branches: Critical bug fixes
```

### **Code Quality**
```typescript
// ESLint configuration for code standards
// Prettier for consistent formatting
// TypeScript strict mode for type safety
// Husky pre-commit hooks for quality gates
```

### **Deployment Pipeline**
```yaml
# Planned CI/CD pipeline
1. Code commit → GitHub
2. Automated tests run
3. Build verification
4. Deploy to staging
5. Manual approval
6. Deploy to production
```

---

**Code Structure Status**: Well-organized with clear separation of concerns. Ready for continued development with established patterns and conventions.
