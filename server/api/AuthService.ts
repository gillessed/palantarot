import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../app/services/auth/index';
import { Config } from '../config';

const oneDayMs = 1000 * 60 * 60 * 24;

export class AuthService {
  public router: Router;

  constructor(private readonly config: Config) {
    this.router = Router();
    this.router.post('/', this.login);
  }

  public login = (req: Request, res: Response) => {
    const request: AuthRequest = req.body;
    if (request.secret === this.config.auth.secret) {
      res.cookie(this.config.auth.cookieName, this.config.auth.token, {
        maxAge: oneDayMs * 30,
        httpOnly: true,
      });
      res.sendStatus(200);
    } else {
      res.send({ error: 'Incorrect password' });
    }
  };
}

export const createRequestValidator = (config: Config) => {
  return (req: Request): boolean => {
    if (req.cookies[config.auth.cookieName] === config.auth.token) {
      return true;
    } else if (req.header(config.auth.authHeaderName) === config.auth.token) {
      return true;
    }
    return false;
  };
};
