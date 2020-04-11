import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request } from 'express';
import logger from 'morgan';
import path from 'path';
import { DynamicRoutes, DynamicRoutesEnumerable, StaticRoutes, StatisRoutesEnumerable as StaticRoutesEnumerable } from '../app/routes';
import { AuthService, createRequestValidator } from './api/AuthService';
import { GameService } from './api/GameService';
import { PlayerService } from './api/PlayerService';
import { StatsService } from './api/StatsService';
import { TarothonService } from './api/TarothonService';
import { Config } from './config';
import { Database } from './db/dbConnector';
import { WebsocketManager } from './websocket/WebsocketManager';
import { SearchService } from './api/SearchService';
import {PlayService} from "./play/PlayService";


const oneDayMs = 1000 * 60 * 60 * 24;
const unauthedRoutes = ['/login', '/favicon', '/resources', '/static', '/src', '/icon', '/.well-known'];

export class App {
  public express: express.Application;
  public requestValidator: (req: Request) => boolean;

  constructor(
    private readonly config: Config,
    private readonly db: Database,
    private readonly websocketManager: WebsocketManager,
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
            next();
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
    for (const start of unauthedRoutes) {
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
    this.express.use('/.well-known', express.static(path.join(this.config.assetDir, '.well-known'), { dotfiles: 'allow' } ));
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

    const gameService = new GameService(this.db, this.websocketManager);
    this.express.use('/api/v1/game', gameService.router);
    
    const statsService = new StatsService(this.db);
    this.express.use('/api/v1/stats', statsService.router);

    const authService = new AuthService(this.config);
    this.express.use('/api/v1/login', authService.router);

    const tarothonService = new TarothonService(this.db);
    this.express.use('/api/v1/tarothon', tarothonService.router);

    const searchService = new SearchService(this.db);
    this.express.use('/api/v1/search', searchService.router);

    const playService = new PlayService();
    this.express.use('/api/v1/play', playService.router);
    this.websocketManager.initPlayService(playService);
  }
 
  private redirectRoute() {
    this.express.use('/', (req, res, next) => {
      if (req.path.startsWith('/.well-known')) {
        next();
      } else if (req.path.startsWith('/api')) {
        res.sendStatus(404);
      } else if (!this.isAppRoute(req.path))  {
        res.redirect('/');
      } else {
        res.sendFile(path.join(path.resolve(), 'index.html'));
      }
    });
  }

  private isAppRoute(path: string): boolean {
    const staticRoutes = Object.keys(StaticRoutes).map((route) => StaticRoutesEnumerable[route]());
    const staticMatch = staticRoutes.find((route) => path === route);
    if (staticMatch) {
      return true;
    }
    const dynamicRoutes = Object.keys(DynamicRoutes).map((route) => new RegExp(DynamicRoutesEnumerable[route]('[^/]+')));
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
