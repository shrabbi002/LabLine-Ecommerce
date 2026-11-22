import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { uploadDir } from './middleware/upload.js';
import User from './models/User.js';
import Item from './models/Item.js';

// Import Route files
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Resolve paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();


// Seed initial Admin User if no users exist
const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments();
    if (adminCount > 0) return;

    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    const name = process.env.INITIAL_ADMIN_NAME || 'Admin';

    if (!email || !password) {
      console.warn('[SEED] No users exist. Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to create the first admin.');
      return;
    }

    await User.create({ name, email, password, role: 'admin' });
    console.log(`[SEED] Initial admin user created for ${email}`);
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

// Seed default Items for product catalog if empty
const seedItems = async () => {
  try {
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      const itemsToSeed = [
        {
          title: 'Quantum Core Processor',
          shortDescription: 'Next-generation quantum-state silicon processor delivering unprecedented clock cycles.',
          description: 'The Quantum Core Processor is engineered for extreme data computation, large-scale deep learning models, and high-frequency real-time operations. Featuring a customized hybrid cooling array and built-in hardware validation encryption keys, it represents the absolute pinnacle of current microchip development. Capable of executing 4.2 trillion operations per second, it integrates natively with standard mainboards.',
          category: 'Hardware',
          price: 1299.00,
          images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'],
          tags: ['CPU', 'Quantum', 'Hardware', 'Spotlight'],
          featured: true,
          status: 'active'
        },
        {
          title: 'AeroOS Cloud Platform',
          shortDescription: 'Fully responsive cloud SaaS productivity interface powered by React & Node.js clusters.',
          description: 'AeroOS is a lightweight cloud operating dashboard designed for decentralized teams. It provides real-time calendar synchronization, instant file sharing with secure end-to-end encryption, multi-role project workspaces, and dynamic visual analytics reporting. With standard glassmorphism layouts and optimized responsive designs, AeroOS operates flawlessly across any smartphone, tablet, or desktop viewport.',
          category: 'Web Apps',
          price: 49.00,
          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'],
          tags: ['SaaS', 'React', 'Productivity'],
          featured: true,
          status: 'active'
        },
        {
          title: 'Vortex Wireless Pro ANC',
          shortDescription: 'High-fidelity audio headphones featuring hybrid active noise cancelling and luxury leather builds.',
          description: 'Vortex Wireless Pro delivers pristine sound quality with an expansive, balanced soundstage. Equipped with hybrid active noise cancellation technology, they eliminate 98% of ambient noise. Hand-crafted using premium memory foam cushions and durable aluminum alloys, they provide comfortable, non-fatiguing listing sessions for up to 45 hours on a single charge.',
          category: 'Audio',
          price: 249.00,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
          tags: ['Wireless', 'ANC', 'Luxury', 'Audio'],
          featured: true,
          status: 'active'
        },
        {
          title: 'Glassmorphism UI Template',
          shortDescription: 'Fully customizable landing pages template library styled with Tailwind CSS v4.',
          description: 'A premium layout template bundle showcasing modern UI components. Includes 12 pre-built responsive pages, smooth keyframe animations, dark-mode toggle states, custom form components with built-in input field validators, and interactive grids. Clean, fully documented React components ready for drop-in use in any commercial project.',
          category: 'Design',
          price: 29.00,
          images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'],
          tags: ['Tailwind', 'React', 'UI Kit'],
          featured: false,
          status: 'active'
        },
        {
          title: 'Solaris Smart Wearable v2',
          shortDescription: 'Solar-charging fitness tracker smartwatch with advanced health diagnostics overlays.',
          description: 'Solaris v2 is a premium smartwatch that harnesses solar energy to extend battery life up to 30 days. Features real-time blood oxygen monitoring, heart rate analysis, sleep quality scoring, and multi-sport activity tracking. The titanium frame and scratch-resistant sapphire glass ensure maximum durability for outdoor exploration.',
          category: 'Wearables',
          price: 349.00,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          tags: ['Smartwatch', 'Fitness', 'Solar', 'GPS'],
          featured: false,
          status: 'active'
        }
      ];

      await Item.create(itemsToSeed);
      console.log(`[SEED] Successfully seeded ${itemsToSeed.length} product items!`);
    }
  } catch (error) {
    console.error('Error seeding items:', error.message);
  }
};

// Seed once per process, after the first successful DB connection.
let seedPromise = null;
const seedAll = () => {
  if (!seedPromise) {
    seedPromise = (async () => {
      await seedAdmin();
      await seedItems();
    })();
  }
  return seedPromise;
};

const app = express();

// Behind Vercel's proxy: needed so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// Set CORS policies (CORS configured to match client's Vite port)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim()) : []),
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
      ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (Security Checklist)
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2000, // generous limit for smooth UI navigation and development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(generalLimiter);

// Specific rate limiters for auth and form submissions
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // allow up to 100 auth attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8, // limit each IP to 8 contact form submissions per 15 minutes
  message: {
    success: false,
    message: 'Too many messages sent. Please wait a bit before sending another message.',
  },
});

// Serve static uploads (images committed in server/uploads, plus any new local uploads)
const uploadsPath = path.join(__dirname, 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));
if (path.resolve(uploadDir) !== path.resolve(uploadsPath) && fs.existsSync(uploadDir)) {
  app.use('/uploads', express.static(uploadDir));
}

// Ensure the database is connected (and seeded) before any API route runs
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    await seedAll();
    next();
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again shortly.' });
  }
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contact', contactLimiter, messageRoutes);

// Root test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Product Website API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// On Vercel the app is imported by api/index.js; locally we start a normal server.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3002;
  connectDB()
    .then(seedAll)
    .catch(() => console.error('Starting without a database connection; API calls will return 503 until it is reachable.'));
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
