const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const axios = require('axios');
const multer = require('multer');
const sharp = require('sharp');
const puppeteer = require('puppeteer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://ota-analyzer-frontend.onrender.com',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await pool.query(
      `INSERT INTO users (id, email, password, name, trial_ends_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, name, trial_ends_at`,
      [
        uuidv4(),
        email,
        hashedPassword,
        name || email.split('@')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
      ]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: newUser.rows[0],
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        name: user.rows[0].name,
        trial_ends_at: user.rows[0].trial_ends_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Project endpoints
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(projects.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, ota_urls, analysis_options } = req.body;

    if (!name || !ota_urls || !analysis_options) {
      return res.status(400).json({ error: 'Name, URLs, and analysis options required' });
    }

    const newProject = await pool.query(
      `INSERT INTO projects (id, user_id, name, description, ota_urls, analysis_options, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [
        uuidv4(),
        req.user.userId,
        name,
        description,
        ota_urls,
        analysis_options
      ]
    );

    res.json(newProject.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, ota_urls, analysis_options, status, results } = req.body;

    const updatedProject = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           ota_urls = COALESCE($3, ota_urls),
           analysis_options = COALESCE($4, analysis_options),
           status = COALESCE($5, status),
           results = COALESCE($6, results),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, description, ota_urls, analysis_options, status, results, req.params.id, req.user.userId]
    );

    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updatedProject.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const deletedProject = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (deletedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analysis trigger endpoint
app.post('/api/projects/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update status to processing
    await pool.query(
      'UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2',
      ['processing', req.params.id]
    );

    // Trigger n8n workflow
    const n8nPayload = {
      projectId: req.params.id,
      userId: req.user.userId,
      projectName: project.rows[0].name,
      otaUrls: project.rows[0].ota_urls,
      analysisOptions: project.rows[0].analysis_options,
      timestamp: new Date().toISOString(),
      webhookUrl: `${process.env.BACKEND_URL || 'https://ota-analyzer-backend.onrender.com'}/api/projects/${req.params.id}/update-status`
    };

    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, n8nPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (n8nError) {
      console.error('n8n trigger error:', n8nError);
      // Don't fail the request, n8n will retry
    }

    res.json({ message: 'Analysis started successfully' });
  } catch (error) {
    console.error('Trigger analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Status update endpoint (called by n8n)
app.post('/api/projects/:id/update-status', async (req, res) => {
  try {
    const { status, results, error } = req.body;

    const updateData = {
      status: status || 'completed',
      updated_at: new Date()
    };

    if (results) {
      updateData.results = results;
    }

    if (error) {
      updateData.error = error;
    }

    const updatedProject = await pool.query(
      `UPDATE projects 
       SET status = $1, results = $2, error = $3, updated_at = $4
       WHERE id = $5
       RETURNING *`,
      [updateData.status, updateData.results, updateData.error, updateData.updated_at, req.params.id]
    );

    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updatedProject.rows[0]);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Screenshot endpoint
app.post('/api/screenshot', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 80,
      fullPage: true 
    });

    await browser.close();

    // Convert to base64
    const base64Screenshot = screenshot.toString('base64');

    res.json({ 
      screenshot: `data:image/jpeg;base64,${base64Screenshot}`,
      url: url
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({ error: 'Screenshot failed' });
  }
});

// AI Analysis endpoint
app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { data, analysisType } = req.body;

    if (!data || !analysisType) {
      return res.status(400).json({ error: 'Data and analysis type required' });
    }

    let systemPrompt = '';
    switch (analysisType) {
      case 'reviews':
        systemPrompt = 'You are an expert OTA listing analyst. Analyze the reviews and return structured JSON with: averageRating, totalReviews, positiveSentiment, reviewHighlights, guestFavorites';
        break;
      case 'images':
        systemPrompt = 'You are an expert OTA listing analyst. Analyze the images and return structured JSON with: heroShotQuality, imageUniqueness, top5Images, imageQuality, sleepingArrangements';
        break;
      case 'amenities':
        systemPrompt = 'You are an expert OTA listing analyst. Analyze the amenities and return structured JSON with: locationHighlights, amenityList, accessibility, uniqueFeatures';
        break;
      default:
        systemPrompt = 'You are an expert OTA listing analyst. Analyze the provided data and return structured JSON results.';
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(data) }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const analysis = completion.choices[0].message.content;

    res.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 