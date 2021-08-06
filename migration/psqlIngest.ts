import * as fs from 'fs';
import {Client} from 'pg';
import {Player} from '../server/model/Player';
import {Dump, Hand, PlayerHand, SqlConfig} from './dump';

if (process.argv.length !== 4) {
  throw Error('Usage: node psqlInjest.js CONFIG_FILE DUMP_FILE');
}

const config: SqlConfig = JSON.parse(
  fs.readFileSync(process.argv[2], {encoding: 'utf8'})
);
const dump: Dump = JSON.parse(
  fs.readFileSync(process.argv[3], {encoding: 'utf8'})
);
console.log(
  `Injesting ${dump.players.length} players, ${dump.hands.length} hands, and ${dump.playerHands.length} player hands.`
);
const client = new Client(config);
inject();

async function inject() {
  await client.connect();

  try {
    const playerColumns: [keyof Player, string][] = [
      ['id', 'id'],
      ['firstName', 'first_name'],
      ['lastName', 'last_name'],
    ];
    await insertType('players', playerColumns, dump.players, 10);

    const handColumns: [keyof Hand, string][] = [
      ['id', 'id'],
      ['timestamp', 'timestamp'],
      ['players', 'players'],
      ['bidder', 'bidder_fk_id'],
      ['partner', 'partner_fk_id'],
      ['bidAmount', 'bid_amt'],
      ['points', 'points'],
      ['slam', 'slam'],
    ];
    await insertType('hand', handColumns, dump.hands.map(sanitizeHand), 100);

    const playerHandColumns: [keyof PlayerHand, string][] = [
      ['id', 'id'],
      ['timestamp', 'timestamp'],
      ['hand', 'hand_fk_id'],
      ['player', 'player_fk_id'],
      ['isBidder', 'was_bidder'],
      ['isPartner', 'was_partner'],
      ['showed', 'showed_trump'],
      ['oneLast', 'one_last'],
      ['points', 'points_earned'],
    ];
    await insertType(
      'player_hand',
      playerHandColumns,
      dump.playerHands.map(sanitizePlayerHand),
      100
    );
  } finally {
    client.end();
  }
}

function sanitizeHand(hand: Hand): Hand {
  return {
    ...hand,
    slam: !!hand.slam,
  };
}

function sanitizePlayerHand(playerHand: PlayerHand): PlayerHand {
  return {
    ...playerHand,
    isBidder: !!playerHand.isBidder,
    isPartner: !!playerHand.isPartner,
    showed: !!playerHand.showed,
    oneLast: !!playerHand.oneLast,
  };
}

async function insertType<T>(
  table: string,
  columnMapping: [keyof T, string][],
  data: T[],
  chunkSize: number
) {
  const chunks = chunkify(data, chunkSize);
  for (const chunk of chunks) {
    await insertChunk(table, columnMapping, chunk);
  }
  await updateSequenceToMax(table);
  console.log('Injested into table ' + table);
}

async function insertChunk<T>(
  table: string,
  columnMapping: [keyof T, string][],
  chunk: T[]
) {
  const valueKeys = columnMapping.map(value => value[0]);
  const values = chunk.map(data => toValueString(data, valueKeys));
  const valuesString = values.join(', ');
  const columnString = columnMapping.map(value => value[1]).join(', ');
  const statement = `INSERT INTO ${table} (${columnString}) VALUES ${valuesString}`;
  await client.query(statement);
}

async function updateSequenceToMax(table: string, column = 'id') {
  const sequence = `${table}_${column}_seq`;
  const maxIdResult = await client.query(`SELECT max(${column}) FROM ${table}`);
  const maxId = maxIdResult.rows[0].max;
  await client.query(`ALTER SEQUENCE ${sequence} RESTART ${maxId + 1}`);
}

function chunkify<T>(array: Array<T>, count = 100): Array<Array<T>> {
  const chunks = [];
  while (array.length > 0) {
    chunks.push(array.splice(0, count));
  }
  return chunks;
}

function toValueString<T>(object: T, keys: Array<keyof T>) {
  return (
    '(' +
    keys
      .map(key => {
        return object[key] === undefined ? 'null' : `'${object[key]}'`;
      })
      .join(', ') +
    ')'
  );
}
