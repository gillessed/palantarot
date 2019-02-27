import mysql from 'mysql';
import * as fs from 'fs';
import { Player } from '../server/model/Player';
import { SqlConfig, Hand, PlayerHand } from './dump';

if (process.argv.length !== 4) {
    console.log('Usage: node mysqlDump.js CONFIG_FILE DUMP_FILE');
    process.exit(1);
}

const config: SqlConfig = JSON.parse(fs.readFileSync(process.argv[2], { encoding: 'utf8' }));
const conn = mysql.createConnection(config);
let players: Player[];
let hands: Hand[];
let playerHands: PlayerHand[];

dumpPlayers();
function dumpPlayers() {
    conn.query('SELECT * FROM players', (_err, values: any[]) => {
        players = values.map((player: any) => {
            return {
                id: player['id'],
                firstName: player['first_name'],
                lastName: player['last_name'],
            };
        });
        dumpHands();
    });
}
function dumpHands() {
    conn.query('SELECT * FROM hand', (_err, values: any[]) => {
        hands = values.map((hand: any) => {
            return {
                id: hand['id'],
                timestamp: hand['timestamp'],
                players: hand['players'],
                bidder: hand['bidder_fk_id'],
                partner: hand['partner_fk_id'] || undefined,
                bidAmount: hand['bid_amt'],
                points: hand['points'],
                slam: !!hand['slam'],
            };
        });
        dumpPlayerHands();
    });
}
function dumpPlayerHands() {
    conn.query('SELECT * FROM player_hand', (_err, values: any[]) => {
        playerHands = values.map((playerHand: any) => {
            return {
                id: playerHand['id'],
                timestamp: playerHand['timestamp'],
                hand: playerHand['hand_fk_id'],
                player: playerHand['player_fk_id'],
                isBidder: playerHand['was_bidder'],
                isPartner: playerHand['was_partner'],
                showed: playerHand['showed_trump'],
                oneLast: playerHand['one_last'],
                points: playerHand['points_earned'],
            };
        });
        dumpedAll();
    });
}
function dumpedAll() {
    const dump = { players, hands, playerHands };
    const serialized = JSON.stringify(dump);
    console.log('Writing ' + serialized.length + ' characters to file ' + process.argv[3]);
    fs.writeFileSync(process.argv[3], serialized, { encoding: 'utf8' });
    conn.end();
}