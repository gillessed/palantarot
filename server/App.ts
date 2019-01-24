import { Database } from './db/dbConnector';
import path from 'path';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { PlayerService } from './api/PlayerService';
import { GameService } from './api/GameService';
import { Config } from './config';
import { AuthService, createRequestValidator } from './api/AuthService';
import { Request } from 'express';
import { StaticRoutes, DynamicRoutes } from '../app/routes';
import { StatsService } from './api/StatsService';

const oneDayMs = 1000 * 60 * 60 * 24;
const unauthedRoutes = ['/login', '/favicon.ico', '/resources', '/static'];

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
    this.express.use(cors())
    this.express.use(logger('dev'));
    this.express.use(cookieParser());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.auth();
  }

  private auth() {
    this.express.use('/', (req, res, next) => {
      const authedRequest = this.requestValidator(req);
      if (req.path.startsWith('/api')) {
        if (!req.path.startsWith('/api/v1/login') && !authedRequest) {
          res.sendStatus(403);
        } else {
          next();
        }
      } else {
        if (this.isProtectedPath(req.path)) {
          if (authedRequest) {
            res.cookie(this.config.auth.cookieName, this.config.auth.token, { maxAge: oneDayMs * 30, httpOnly: true});
            next()
          } else {
            res.clearCookie(this.config.auth.cookieName);
            res.redirect('/login');
          }
        } else if (req.path === '/login' && authedRequest) {
          res.redirect(StaticRoutes.home());
        } else if(req.path === '/logout') {
          res.clearCookie(this.config.auth.cookieName);
          res.redirect('/login');
        } else {
          next();
        }
      }
    });
  }

  private isProtectedPath(path: string) {
    for (let start of unauthedRoutes) {
      if (path.startsWith(start)) {
        return false;
      }
    }
    return true;
  }

  private routes() {
    this.staticRoutes();
    this.apiRoutes();
    this.redirectRoute();
  }

  private staticRoutes() {
    this.express.use('/favicon-16x16.png', express.static(this.config.assetDir + '/static/images/favicon-16x16.png'));
    this.express.use('/favicon-32x32.png', express.static(this.config.assetDir + '/static/images/favicon-32x32.png'));
    this.express.use('/src', express.static(path.resolve(this.config.assetDir, 'src')));
    this.express.use('/static', express.static(path.resolve(this.config.assetDir, 'static')));
    this.express.get('/icons-*', (req, res) => {
      const filename = path.basename(req.path);
      res.sendFile(path.resolve(this.config.assetDir, filename));
    });
  }

  private apiRoutes() {
    const playerService = new PlayerService(this.db);
    this.express.use('/api/v1/players', playerService.router);

    const gameService = new GameService(this.db);
    this.express.use('/api/v1/game', gameService.router);
    
    const statsService = new StatsService(this.db);
    this.express.use('/api/v1/stats', statsService.router);

    const authService = new AuthService(this.config);
    this.express.use('/api/v1/login', authService.router);
  }

  private redirectRoute() {
    this.express.use('/', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.sendStatus(404);
      } else if (!this.isAppRoute(req.path))  {
        res.redirect('/');
      } else {
        res.sendFile(path.join(path.resolve(), 'index.html'));
      }
    });
  }

  private isAppRoute(path: string): boolean {
    const staticRoutes = Object.keys(StaticRoutes).map((route) => StaticRoutes[route]());
    const staticMatch = staticRoutes.find((route) => path === route);
    if (staticMatch) {
      return true;
    }
    const dynamicRoutes = Object.keys(DynamicRoutes).map((route) => new RegExp(DynamicRoutes[route]('[^/]+')));
    const dynamicMatch = dynamicRoutes.find((routeRegex) => routeRegex.test(path));
    if (dynamicMatch) {
      return true;
    }
    if (path === '/') {
      return true;
    }
    return false;
  }
}