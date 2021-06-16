import { Request, Response, Router } from 'express';
import * as _ from 'lodash';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { TarothonQuerier } from '../db/TarothonQuerier';
import { RoleResult } from '../model/Result';
import { NewTarothon, Tarothon, TarothonData } from '../model/Tarothon';
import { Database } from './../db/dbConnector';

export class TarothonService {
  public router: Router;
  private tarothonDb: TarothonQuerier;
  private gameDb: GameRecordQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.tarothonDb = new TarothonQuerier(db);
    this.gameDb = new GameRecordQuerier(db);
    this.router.get('/data/:id', this.getTarothonData);
    this.router.get('/get', this.getTarothons);
    this.router.post('/add', this.addTarothon);
    this.router.post('/delete', this.deleteTarothon);
  }

  public getTarothonData = (req: Request, res: Response) => {
    const id = req.params['id'];
    this.tarothonDb.getTarothon(id).then((tarothon: Tarothon) => {
      return this.gameDb.queryResultsBetweenDates(tarothon.begin, tarothon.end).then((results: RoleResult[]) => {
        const data: TarothonData = {
          properties: tarothon,
          results,
        };
        res.send(data);
      });
    }).catch((error: any) => {
      res.send({ error: 'Error loading tarothon' + id + ': ' + error });
    });
  }

  public getTarothons = (_: Request, res: Response) => {
    this.tarothonDb.getTarothons().then((tarothon: Tarothon[]) => {
      res.send(tarothon);
    }).catch((error: any) => {
      res.send({ error: 'Error fetching tarothons: ' + error });
    });
  }

  public addTarothon = (req: Request, res: Response) => {
    if (_.has(req.body, 'id')) {
      const data = req.body as Tarothon;
      this.tarothonDb.editTarothon(data).then(() => {
        res.send({ id: data.id });
      }).catch((error: any) => {
        res.send({ error: 'Error editing tarothon ' + data.id + ': ' + error });
      });
    } else {
      const data = req.body as NewTarothon;
      this.tarothonDb.insertTarothon(data).then((id: string) => {
        res.send({ id });
      }).catch((error: any) => {
        console.log(error);
        res.send({ error: 'Error inserting tarothon: ' + error });
      });
    }
  }

  public deleteTarothon = (req: Request, res: Response) => {
    const data = req.body as { id: string };
    this.tarothonDb.deleteTarothon(data.id).then(() => {
      res.sendStatus(200);
    }).catch((error: any) => {
      res.send({ error: 'Error deleting tarothon ' + data.id + ': ' + error });
    });
  }
}
