import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware() {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  private routes() {
    const router = express.Router();
    this.express.use('/app', express.static('build/app'))
    this.express.use('/static', express.static('build/static'))
    //TODO: api router
    router.get('/*', (_, res) => {
      res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
    this.express.use('/*', router);
  }
}

export default new App().express;