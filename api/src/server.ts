import app from './app.js';
import { config } from './config/index.js';
import connectDB from './config/database.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const PORT = config.PORT;

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  AstroBeacon API Server                                    ║
║  Environment: ${config.NODE_ENV.padEnd(35)}║
║  Port: ${PORT.toString().padEnd(40)}║
║  Health: http://localhost:${PORT}/api/v1/health              ║
║  Database: Connected                                        ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
};

startServer();