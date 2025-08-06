# OTA Analyzer - Full SaaS Application

A comprehensive SaaS application for analyzing OTA (Online Travel Agency) listings using AI-powered insights. Built with Vue 3, Supabase, n8n, and TailwindCSS.

## 🚀 Features

### Authentication & User Management
- **Email/Password Authentication** - Secure sign up and login
- **OAuth Integration** - Google and Apple sign-in
- **Email Verification** - Account verification workflow
- **Password Reset** - Secure password recovery
- **Trial Management** - 30-day free trial with metadata tracking

### Project Management
- **Multi-step Project Wizard** - Guided project creation
- **OTA Platform Selection** - Support for Airbnb, Booking.com, VRBO, Expedia, Hotels.com, TripAdvisor
- **URL Management** - Bulk URL input and validation
- **Analysis Options** - Configurable analysis types (reviews, images, amenities, pricing, location, competition)

### AI-Powered Analysis
- **Review Analysis** - Sentiment analysis, rating extraction, guest feedback insights
- **Image Analysis** - Photo quality assessment, composition analysis, visual appeal scoring
- **Amenities Analysis** - Feature extraction and categorization
- **Pricing Analysis** - Competitive pricing insights
- **Location Analysis** - Neighborhood and accessibility factors
- **Competitive Analysis** - Market positioning insights

### Results & Reporting
- **Interactive Dashboard** - Real-time project status and statistics
- **Data Visualization** - Charts and graphs for insights
- **PDF Reports** - Professional report generation
- **Public Sharing** - Shareable project links
- **Export Options** - Multiple export formats

### Technical Features
- **Real-time Updates** - Live status updates during analysis
- **Responsive Design** - Mobile-first responsive interface
- **Modern UI/UX** - Beautiful, intuitive interface with TailwindCSS
- **Type Safety** - Full TypeScript support
- **State Management** - Pinia for reactive state management

## 🏗️ Architecture

### Frontend (Vue 3)
- **Vue 3 Composition API** - Modern reactive framework
- **Vue Router** - Client-side routing with authentication guards
- **Pinia** - State management with stores for auth and projects
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### Backend (Supabase)
- **Authentication** - Built-in auth with RLS (Row Level Security)
- **Database** - PostgreSQL with real-time subscriptions
- **Storage** - File storage for screenshots and reports
- **Edge Functions** - Serverless functions for API endpoints
- **RLS Policies** - Secure data access control

### Automation (n8n)
- **Webhook Integration** - Trigger analysis workflows
- **Data Processing** - Screenshot capture and data extraction
- **AI Integration** - OpenAI GPT for intelligent analysis
- **Error Handling** - Robust error management and retry logic

### AI Integration (OpenAI)
- **GPT-4o** - Advanced text analysis and insights
- **Structured Output** - JSON-formatted analysis results
- **Multi-modal Analysis** - Text and image processing capabilities

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- n8n instance
- OpenAI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ota-analyzer-saas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Configuration
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# App Configuration
VITE_APP_NAME=OTA Analyzer
VITE_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ota_urls TEXT[],
  analysis_options TEXT[],
  results JSONB,
  share_token UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared projects" ON projects
  FOR SELECT USING (share_token IS NOT NULL);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

-- Storage policies
CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Users can upload reports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');
```

#### Authentication Setup
1. Configure OAuth providers (Google, Apple) in Supabase Auth settings
2. Set up email templates for verification and password reset
3. Configure redirect URLs for OAuth providers

### 5. n8n Workflow Setup

Create an n8n workflow with the following nodes:

1. **Webhook Trigger** - Accept project data
2. **HTTP Request** - Take screenshots using Playwright/Puppeteer
3. **OpenAI** - Process data with GPT-4o
4. **Supabase** - Store results
5. **HTTP Request** - Update project status

### 6. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Supabase Edge Functions
Deploy API functions for secure n8n integration:

```bash
supabase functions deploy trigger-analysis
```

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── Login.vue
│   ├── SignUp.vue
│   ├── Dashboard.vue
│   ├── Projects.vue
│   ├── NewProject.vue
│   ├── ProjectDetail.vue
│   └── ProjectShare.vue
├── stores/             # Pinia stores
│   ├── auth.js
│   └── projects.js
├── router/             # Vue Router configuration
├── lib/                # Utility libraries
│   └── supabase.js
├── style.css           # Global styles
├── main.js             # Application entry point
└── App.vue             # Root component
```

## 🔧 Configuration

### TailwindCSS
Custom design system with primary colors and components defined in `tailwind.config.js`

### Authentication
Configured with Supabase Auth, supporting email/password and OAuth providers

### State Management
Pinia stores for authentication and project management with reactive state

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/reset-password` - Password reset
- `POST /auth/update-password` - Update password

### Project Endpoints
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/trigger-analysis` - Start analysis
- `GET /projects/:token/share` - Public project view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Roadmap

- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom report templates
- [ ] API rate limiting
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced AI models integration
- [ ] Real-time collaboration
- [ ] Advanced export options
- [ ] Integration with more OTA platforms 