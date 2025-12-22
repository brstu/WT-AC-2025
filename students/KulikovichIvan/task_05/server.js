import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { z } from 'zod';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api/v1';

const profiles = new Map();
const portfolios = new Map();

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

const profileSchema = z.object({
  username: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  fullName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  skills: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().default(true),
});

const profileUpdateSchema = profileSchema.partial();

const portfolioSchema = z.object({
  profileId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  projectUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  technologies: z.array(z.string()).max(15).optional(),
  category: z.enum(['web', 'mobile', 'desktop', 'data-science', 'devops', 'other']).default('other'),
  isFeatured: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const portfolioUpdateSchema = portfolioSchema.partial().omit({ profileId: true });

const querySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
  isPublic: z.enum(['true', 'false']).optional(),
  category: z.string().optional(),
  technologies: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const validate = (schema) => (req, res, next) => {
  try {
    const data = { ...req.body, ...req.query, ...req.params };
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    
    req.validatedData = result.data;
    next();
  } catch (error) {
    next(error);
  }
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Profiles & Portfolio API',
      version: '1.0.0',
      description: 'REST API for user profiles and portfolios',
    },
    servers: [{ url: `http://localhost:${PORT}${API_PREFIX}` }],
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.json({
    message: 'User Profiles & Portfolio API',
    version: '1.0.0',
    documentation: '/docs',
    health_check: '/health',
    api_endpoints: {
      profiles: `${API_PREFIX}/profiles`,
      portfolio: `${API_PREFIX}/portfolio`,
      profile_portfolio: `${API_PREFIX}/profiles/:id/portfolio`
    },
    examples: {
      create_profile: 'POST /api/v1/profiles',
      get_profiles: 'GET /api/v1/profiles?limit=10&offset=0',
      filter_profiles: 'GET /api/v1/profiles?skills=JavaScript,React'
    }
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

app.get('/ping', (req, res) => {
  res.json({ pong: new Date().toISOString() });
});

app.get(`${API_PREFIX}/profiles`, validate(querySchema), (req, res) => {
  try {
    const { q, location, skills, isPublic, limit = 20, offset = 0, sortBy = 'createdAt', order = 'desc' } = req.validatedData;
    
    let results = Array.from(profiles.values());
    
    if (q) {
      const search = q.toLowerCase();
      results = results.filter(p =>
        p.username.toLowerCase().includes(search) ||
        p.fullName?.toLowerCase().includes(search) ||
        p.bio?.toLowerCase().includes(search)
      );
    }
    
    if (location) {
      results = results.filter(p => p.location?.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (skills) {
      const requiredSkills = skills.split(',').map(s => s.trim().toLowerCase());
      results = results.filter(p => p.skills?.some(s => requiredSkills.includes(s.toLowerCase())));
    }
    
    if (isPublic !== undefined) {
      results = results.filter(p => p.isPublic === (isPublic === 'true'));
    }
    
    const sortOrder = order === 'asc' ? 1 : -1;
    results.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });
    
    const total = results.length;
    const paginated = results.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginated,
      meta: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/profiles/:id`, (req, res, next) => {
  try {
    const profile = profiles.get(req.params.id);
    if (!profile) throw new NotFoundError('Profile');
    
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

app.post(`${API_PREFIX}/profiles`, validate(profileSchema), (req, res, next) => {
  try {
    for (const profile of profiles.values()) {
      if (profile.username === req.validatedData.username) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      if (profile.email === req.validatedData.email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }
    
    const profile = {
      id: generateId(),
      ...req.validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    profiles.set(profile.id, profile);
    
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

app.patch(`${API_PREFIX}/profiles/:id`, validate(profileUpdateSchema), (req, res, next) => {
  try {
    const profile = profiles.get(req.params.id);
    if (!profile) throw new NotFoundError('Profile');
    
    const updated = {
      ...profile,
      ...req.validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    profiles.set(profile.id, updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

app.delete(`${API_PREFIX}/profiles/:id`, (req, res, next) => {
  try {
    if (!profiles.has(req.params.id)) throw new NotFoundError('Profile');
    
    profiles.delete(req.params.id);
    
    for (const [id, portfolio] of portfolios) {
      if (portfolio.profileId === req.params.id) {
        portfolios.delete(id);
      }
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/profiles/:profileId/portfolio`, validate(querySchema), (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { category, isFeatured, technologies, limit = 20, offset = 0 } = req.validatedData;
    
    let results = Array.from(portfolios.values())
      .filter(p => p.profileId === profileId);
    
    if (category) results = results.filter(p => p.category === category);
    if (isFeatured !== undefined) results = results.filter(p => p.isFeatured === (isFeatured === 'true'));
    if (technologies) {
      const techs = technologies.split(',').map(t => t.trim().toLowerCase());
      results = results.filter(p => p.technologies?.some(t => techs.includes(t.toLowerCase())));
    }
    
    const total = results.length;
    const paginated = results.slice(offset, offset + limit);
    
    res.json({
      success: true,
      data: paginated,
      meta: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    next(error);
  }
});

app.post(`${API_PREFIX}/portfolio`, validate(portfolioSchema), (req, res, next) => {
  try {
    if (!profiles.has(req.validatedData.profileId)) {
      throw new NotFoundError('Profile');
    }
    
    const portfolio = {
      id: generateId(),
      ...req.validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    portfolios.set(portfolio.id, portfolio);
    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
});

app.get(`${API_PREFIX}/portfolio/:id`, (req, res, next) => {
  try {
    const portfolio = portfolios.get(req.params.id);
    if (!portfolio) throw new NotFoundError('Portfolio item');
    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
});

app.patch(`${API_PREFIX}/portfolio/:id`, validate(portfolioUpdateSchema), (req, res, next) => {
  try {
    const portfolio = portfolios.get(req.params.id);
    if (!portfolio) throw new NotFoundError('Portfolio item');
    
    const updated = {
      ...portfolio,
      ...req.validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    portfolios.set(portfolio.id, updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

app.delete(`${API_PREFIX}/portfolio/:id`, (req, res, next) => {
  try {
    if (!portfolios.has(req.params.id)) throw new NotFoundError('Portfolio item');
    portfolios.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    records: {
      profiles: profiles.size,
      portfolios: portfolios.size,
    }
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  const status = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };
  
  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;
  
  res.status(status).json(response);
});

app.listen(PORT, () => {
  console.log(`
  🚀 Server running on http://localhost:${PORT}
  📚 API Docs: http://localhost:${PORT}/docs
  🌐 Health check: http://localhost:${PORT}/health
  🔗 API Base: http://localhost:${PORT}${API_PREFIX}
  `);
});