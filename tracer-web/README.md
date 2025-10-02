# Tracer Web - Full Stack Project Management Application

A comprehensive project management application built with Next.js, MongoDB Atlas, and TypeScript. This application provides tools for managing projects, tasks, agents, and planning sessions with a modern, responsive interface.

## Features

- **Project Management**: Create, update, and manage projects with detailed descriptions and status tracking
- **Task Management**: Organize tasks with priorities, dependencies, and time tracking
- **Agent Management**: Manage AI agents and team members with capabilities and efficiency ratings
- **Planning Sessions**: Create and manage planning sessions for project coordination
- **Real-time Updates**: Live updates across the application using React Context
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript implementation for better development experience

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication (ready for implementation)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tracer-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tracer-web?retryWrites=true&w=majority
   
   # JWT Secret for authentication (generate a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # Environment
   NODE_ENV=development
   ```

4. **Set up MongoDB Atlas**
   
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and replace the placeholders in `.env.local`
   - Whitelist your IP address in Atlas security settings

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── projects/      # Project CRUD operations
│   │   ├── tasks/         # Task CRUD operations
│   │   ├── agents/        # Agent CRUD operations
│   │   └── planning-sessions/ # Planning session CRUD operations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Dashboard.tsx     # Main dashboard
│   ├── ProjectManager.tsx # Project management
│   ├── TaskGrid.tsx      # Task display
│   ├── AgentGrid.tsx     # Agent display
│   └── PlanningBoard.tsx # Planning interface
├── context/              # React Context providers
│   ├── AppContext.tsx    # Main application state
│   └── ThemeContext.tsx  # Theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   ├── mongodb.ts       # Database connection
│   ├── validation.ts    # Input validation
│   └── error-handler.ts # Error handling
├── models/              # MongoDB models
│   ├── Project.ts       # Project schema
│   ├── Task.ts          # Task schema
│   ├── Agent.ts         # Agent schema
│   └── PlanningSession.ts # Planning session schema
└── types/               # TypeScript type definitions
    └── index.ts         # Core types
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get project by ID
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/stats` - Get project statistics

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get task by ID
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/assign` - Assign task to agent
- `DELETE /api/tasks/assign` - Unassign task from agent

### Agents
- `GET /api/agents` - Get all agents (with filtering)
- `POST /api/agents` - Create a new agent
- `GET /api/agents/[id]` - Get agent by ID
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent

### Planning Sessions
- `GET /api/planning-sessions` - Get all planning sessions
- `POST /api/planning-sessions` - Create a new planning session
- `GET /api/planning-sessions/[id]` - Get planning session by ID
- `PUT /api/planning-sessions/[id]` - Update planning session
- `DELETE /api/planning-sessions/[id]` - Delete planning session

## Database Schema

### Project
```typescript
{
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'archived'
  ownerId?: ObjectId
  createdAt: Date
  updatedAt: Date
}
```

### Task
```typescript
{
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  projectId: ObjectId
  agentId?: ObjectId
  dependencies: ObjectId[]
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
}
```

### Agent
```typescript
{
  name: string
  type: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'ai'
  status: 'idle' | 'working' | 'busy' | 'suspended'
  projectId: ObjectId
  currentTaskId?: ObjectId
  capabilities: string[]
  efficiency: number (0-1)
  createdAt: Date
  updatedAt: Date
}
```

### Planning Session
```typescript
{
  name: string
  description: string
  projectId: ObjectId
  status: 'draft' | 'active' | 'completed'
  tasks: ObjectId[]
  agents: ObjectId[]
  createdAt: Date
  updatedAt: Date
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint for code linting and follows Next.js best practices. TypeScript is used throughout for type safety.

### Adding New Features

1. **API Routes**: Add new routes in `src/app/api/`
2. **Components**: Add new components in `src/components/`
3. **Types**: Add new types in `src/types/index.ts`
4. **Models**: Add new MongoDB models in `src/models/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Roadmap

- [ ] User authentication and authorization
- [ ] Real-time collaboration features
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with external tools
- [ ] Advanced task automation
- [ ] Team management features
- [ ] File upload and management
- [ ] Notification system
- [ ] API rate limiting and security enhancements