import * as fs from 'fs';

export interface Config {
  port: number;
  auth: {
    cookieDurationDays: number;
    cookieName: string;
    secret: string;
    token: string;
    authHeaderName: string;
  };
  assetDir: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

export function readConfig(): Config {
  return JSON.parse(fs.readFileSync('config.json', 'utf8'));
}