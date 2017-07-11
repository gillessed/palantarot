import * as fs from 'fs';

export interface Config {
  auth: {
    cookieDurationDays: number;
    cookieName: string;
    secret: string;
    token: string;
    authHeaderName: string;
  }
}

export function readConfig(): Config {
  return JSON.parse(fs.readFileSync('config.json', 'utf8'));
}