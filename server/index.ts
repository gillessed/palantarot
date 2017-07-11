import http from 'http';
import { App } from './App';
import { connect, Database } from './db/dbConnector';
import { readConfig } from './config';

const config = readConfig();

connect({
  // TODO: move this to config.json
  host: 'localhost',
  port: 3306,
  user: 'palantir',
  password: 'Palantir1!',
  database: 'palantir',
}, (db: Database) => {
  const port = 7456;
  const app = new App(config, db);
  app.express.set('port', port);

  const server = http.createServer(app.express);
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListen);

  function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListen(): void {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  }
});