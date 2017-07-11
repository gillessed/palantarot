import { Database } from './db/dbConnector';
import path from 'path';
import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { PlayerService } from './api/PlayerService';
import { GameService } from './api/GameService';
import { Config } from './config';
import { AuthService, createRequestValidator } from './api/AuthService';
import { Routes } from '../app/routes';
import { Request } from 'express';

export class App {
  public express: express.Application;
  public requestValidator: (req: Request) => boolean;

  constructor(
    private readonly config: Config,
    private readonly db: Database,
  ) {
    this.requestValidator = createRequestValidator(config);
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware() {
    this.express.use(logger('dev'));
    this.express.use(cookieParser());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.auth();
  }

  private auth() {
    this.express.use('/', (req, res, next) => {
      const authedRequest = this.requestValidator(req);
      if ((req.path.startsWith('/app') || req.path === '/') && !authedRequest) {
        res.clearCookie(this.config.auth.cookieName);
        res.redirect('/login');
      } else if (
          req.path.startsWith('/api') &&
          !req.path.startsWith('/api/v1/login') && 
          !authedRequest) {
        res.sendStatus(403);
      } else if (req.path === '/login' && authedRequest) {
        res.redirect(Routes.home());
      } else {
        next();
      }
    });
  }
  private routes() {
    this.staticRoutes();
    this.apiRoutes();
    this.redirectRoute();
  }

  private staticRoutes() {
    this.express.use('/favicon.ico', express.static(this.config.assetDir + '/static/favicon.ico'));
    this.express.use('/resources', express.static(this.config.assetDir + '/app'));
    this.express.use('/static', express.static(this.config.assetDir + '/static'));
  }

  private apiRoutes() {
    const playerService = new PlayerService(this.db);
    this.express.use('/api/v1/players', playerService.router);

    const gameService = new GameService(this.db);
    this.express.use('/api/v1/game', gameService.router);

    const authService = new AuthService(this.config);
    this.express.use('/api/v1/login', authService.router);
  }

  private redirectRoute() {
    this.express.use('/', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.sendStatus(404);
      } else {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
      }
    });
  }
}