import app from './app.js';
import { config } from './config/index.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  AstroBeacon API Server                                    ║
║  Environment: ${config.NODE_ENV.padEnd(35)}║
║  Port: ${PORT.toString().padEnd(40)}║
║  Health: http://localhost:${PORT}/api/v1/health              ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
