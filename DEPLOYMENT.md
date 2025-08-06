# Deployment Guide - OTA Analyzer SaaS

This guide covers deploying the OTA Analyzer SaaS application to production environments.

## 🚀 Quick Start

### 1. Frontend Deployment (Vercel)

#### Prerequisites
- Vercel account
- GitHub repository connected

#### Steps
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Configure Environment Variables**
   In Vercel dashboard, add the following environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_APP_NAME=OTA Analyzer
   VITE_APP_URL=https://your-domain.vercel.app
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

### 2. Supabase Setup

#### Database Setup
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down project URL and anon key

2. **Run Database Schema**
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

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure site URL and redirect URLs
   - Set up OAuth providers (Google, Apple)
   - Configure email templates

4. **Deploy Edge Functions**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link project
   supabase link --project-ref your-project-ref

   # Deploy functions
   supabase functions deploy trigger-analysis
   supabase functions deploy update-project-status
   ```

### 3. n8n Setup

#### Self-Hosted n8n
1. **Install n8n**
   ```bash
   # Using Docker
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

2. **Import Workflow**
   - Open n8n at `http://localhost:5678`
   - Import the workflow from `n8n-workflow.json`
   - Configure environment variables:
     ```
     OPENAI_API_KEY=your_openai_api_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

3. **Configure Webhook**
   - Note the webhook URL from the workflow
   - Update `VITE_N8N_WEBHOOK_URL` in your environment variables

#### n8n Cloud
1. **Create Account**
   - Sign up at [n8n.cloud](https://n8n.cloud)
   - Create new workspace

2. **Import Workflow**
   - Import the workflow from `n8n-workflow.json`
   - Configure environment variables
   - Activate the workflow

### 4. OpenAI Setup

1. **Create OpenAI Account**
   - Sign up at [openai.com](https://openai.com)
   - Add billing information

2. **Generate API Key**
   - Go to API Keys section
   - Create new API key
   - Add to environment variables

## 🔧 Production Configuration

### Environment Variables

#### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_APP_NAME=OTA Analyzer
VITE_APP_URL=https://your-domain.com
```

#### Supabase Edge Functions
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/ota-analysis
```

#### n8n Environment
```env
OPENAI_API_KEY=sk-your-openai-key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=https://your-project.supabase.co
```

### Security Considerations

1. **CORS Configuration**
   - Configure allowed origins in Supabase
   - Set up proper CORS headers

2. **API Rate Limiting**
   - Implement rate limiting for API endpoints
   - Monitor usage and set appropriate limits

3. **Data Encryption**
   - Enable encryption at rest in Supabase
   - Use HTTPS for all communications

4. **Authentication**
   - Enable email verification
   - Set up proper password policies
   - Configure session management

### Monitoring & Analytics

1. **Error Tracking**
   - Set up Sentry for error monitoring
   - Configure logging for Edge Functions

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor Supabase performance
   - Track n8n workflow execution

3. **Usage Analytics**
   - Track user engagement
   - Monitor API usage
   - Analyze conversion rates

## 🚀 Scaling Considerations

### Database Scaling
- Monitor Supabase usage
- Consider upgrading plan for higher limits
- Implement database optimization

### n8n Scaling
- Use n8n Cloud for managed scaling
- Consider self-hosted with load balancing
- Monitor workflow execution times

### Frontend Scaling
- Vercel handles automatic scaling
- Use CDN for static assets
- Implement caching strategies

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Management
- Use different environments for staging/production
- Implement feature flags
- Manage secrets securely

## 📊 Monitoring & Maintenance

### Regular Tasks
1. **Database Maintenance**
   - Monitor storage usage
   - Clean up old data
   - Optimize queries

2. **Security Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits

3. **Performance Optimization**
   - Monitor response times
   - Optimize images and assets
   - Implement caching

### Backup Strategy
1. **Database Backups**
   - Supabase handles automatic backups
   - Consider additional backup solutions

2. **Code Backups**
   - Use Git for version control
   - Regular repository backups

3. **Configuration Backups**
   - Document all configurations
   - Backup environment variables

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase configuration
   - Verify OAuth provider settings
   - Check redirect URLs

2. **n8n Workflow Failures**
   - Check webhook URLs
   - Verify API keys
   - Monitor workflow logs

3. **Database Connection Issues**
   - Check Supabase status
   - Verify connection strings
   - Check RLS policies

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 📈 Performance Optimization

### Frontend Optimization
- Implement code splitting
- Use lazy loading for components
- Optimize bundle size
- Implement caching strategies

### Backend Optimization
- Optimize database queries
- Implement connection pooling
- Use CDN for static assets
- Monitor API response times

### n8n Optimization
- Optimize workflow execution
- Implement error handling
- Use appropriate node types
- Monitor resource usage 