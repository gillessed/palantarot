import { Database } from './db/dbConnector';
import path from 'path';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';

import { PlayerService } from './api/PlayerService';
import { GameService } from './api/GameService';

export class App {
  public express: express.Application;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware() {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes() {
    this.staticRoutes();
    this.apiRoutes();
    this.redirectRoute();
  }

  private staticRoutes() {
    this.express.use('/app', express.static('build/app'));
    this.express.use('/static', express.static('build/static'));
  }

  private apiRoutes() {
    const playerService = new PlayerService(this.db);
    this.express.use('/api/v1/players', playerService.router);

    const gameService = new GameService(this.db);
    this.express.use('/api/v1/game', gameService.router);
  }

  private redirectRoute() {
    this.express.use('/*', (_, res) => {
      res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
  }
}