import https, { ServerOptions } from 'https';
import http from 'http';
import fs from 'fs';
import { App } from './App';
import { connect, Database } from './db/dbConnector';
import { readConfig } from './config';

const config = readConfig();

connect(config.database, (db: Database) => {
  const port = config.port;
  const app = new App(config, db);
  app.express.set('port', port);
  if (config.https.enabled) {
    const redirect = http.createServer((req, res) => {
      const redirect = "https://" + req.headers['host'] + req.url;
      res.writeHead(301, { "Location": redirect });
      res.end();
    });
    redirect.listen(config.https.httpRedirectPort);
    redirect.on('error', onError);
    redirect.on('listening', () => console.log('Redirect http traffic'));

    let httpsOptions: ServerOptions = {
      key: fs.readFileSync(config.https.key),
      cert: fs.readFileSync(config.https.cert),
    };
    if (config.https.ca) {
      httpsOptions = {
        ...httpsOptions,
        ca: fs.readFileSync(config.https.ca),
      };
    }
    const server = https.createServer(httpsOptions, app.express);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListen);
  } else {
    const server = http.createServer(app.express);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListen);
  }

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
    const protocol = config.https.enabled ? 'https' : 'http';
    console.log(`Listening on ${protocol} on port ${config.port}`);
  }
});