-- Schema for tarot game storage in postgresql

CREATE TABLE hand (
    id             SERIAL,
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
    players        INT NOT NULL,
    bidder_fk_id   INT NOT NULL,
    partner_fk_id  INT DEFAULT NULL,
    bid_amt        INT NOT NULL,
    points         INT NOT NULL,
    slam           BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id)
);

CREATE TABLE players (
    id          SERIAL,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE player_hand (
    id              SERIAL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
    hand_fk_id      INT NOT NULL,
    player_fk_id    INT NOT NULL,
    was_bidder      BOOLEAN DEFAULT false,
    was_partner     BOOLEAN DEFAULT false,
    showed_trump    BOOLEAN DEFAULT false,
    one_last        BOOLEAN DEFAULT false,
    points_earned   INT NOT NULL,
    is_bot          BOOLEAN DEFAULT false,
    bot_type        TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE tarothon (
    id             SERIAL,
    begin_date     TIMESTAMPTZ NOT NULL,
    end_date       TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id)
);

CREATE TYPE tuple2 AS (maxCount int, lastId int);

CREATE OR REPLACE FUNCTION getStreak(playerId numeric, win boolean)
RETURNS tuple2 AS $streak$
DECLARE
	gameId integer;
	counter integer;
	maxCount integer;
	maxId integer;
	r record;
BEGIN
	counter := 0;
	maxCount := 0;
   	FOR r IN
		SELECT id, (CASE WHEN SIGN(LAG(points_earned) over ()) IS DISTINCT FROM SIGN(points_earned) OR (points_earned > 0 AND win) OR (points_earned < 0 AND NOT win) THEN FALSE ELSE TRUE END) AS streak FROM player_hand WHERE player_fk_id=playerId
	LOOP
	   	IF r.streak THEN
	   		counter := counter + 1;
			IF counter > maxCount THEN
				maxCount := counter;
				maxId := r.id;
			END IF;
		ELSE
			counter := 0;
	   	END IF;
	END LOOP;
	RETURN (maxId, maxCount);
END;
$streak$ LANGUAGE plpgsql;
