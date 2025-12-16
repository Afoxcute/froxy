import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import registerRoutes from './routes/register';
import yakoaRoutes from './routes/yakoaRoutes';
import licenseRoutes from './routes/license';
import infringementRoutes from './routes/infringement';
import arbitrationRoutes from './routes/arbitration';
import ipAssetLockerRoutes from './routes/ip-asset-locker';
import subscriptionRoutes from './routes/subscriptions';
import serviceRoutes from './routes/services';

// Load environment variables
dotenv.config();

// Test database connection on startup
import { prisma } from './lib/prisma';

async function testDatabaseConnection() {
  try {
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n📋 Troubleshooting steps:');
      console.error('1. Check if your Aiven database is running (not paused)');
      console.error('2. Verify the DATABASE_URL in your .env file');
      console.error('3. Check if your IP is whitelisted in Aiven firewall settings');
      console.error('4. Try using the connection pooler URL (port 10189) instead of direct connection');
      console.error('5. Verify network connectivity to the database host');
      
      if (process.env.DATABASE_URL) {
        try {
          const url = new URL(process.env.DATABASE_URL);
          console.error(`\nCurrent connection: ${url.hostname}:${url.port}`);
        } catch {
          console.error('\nDATABASE_URL format might be incorrect');
        }
      }
    } else if (error.code === 'P1017') {
      console.error('\n📋 Server closed the connection. Possible causes:');
      console.error('1. Database server is overloaded');
      console.error('2. Connection timeout - try using connection pooler');
      console.error('3. Too many connections - check connection limits');
    }
    
    return false;
  }
}

// Test connection asynchronously (don't block server startup)
testDatabaseConnection();

const app = express();

// Parse command-line arguments for port
function getPortFromArgs(): number | null {
  const args = process.argv.slice(2);
  const portIndex = args.findIndex(arg => arg === '-p' || arg === '--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    return parseInt(args[portIndex + 1], 10);
  }
  return null;
}

const PORT = getPortFromArgs() || parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/register', registerRoutes);
app.use('/api/yakoa', yakoaRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/infringement', infringementRoutes);
app.use('/api/arbitration', arbitrationRoutes);
app.use('/api/ip-asset-locker', ipAssetLockerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/services', serviceRoutes);

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Default route (optional)
app.get('/', (_req, res) => {
  res.json({
    message: '✅ Yakoa + Cronos Testnet + Arbitration backend is running!',
    version: '1.0.0',
    endpoints: {
      register: '/api/register',
      yakoa: '/api/yakoa',
      license: '/api/license',
      arbitration: '/api/arbitration',
      ipAssetLocker: '/api/ip-asset-locker',
      subscriptions: '/api/subscriptions',
      services: '/api/services',
      health: '/health',
    }
  });
});

// 404 handler - return JSON instead of HTML
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist. Check the root path for available endpoints.'
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
