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
    id             SERIAL,
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT now(),
    hand_fk_id     INT NOT NULL,
    player_fk_id   INT NOT NULL,
    was_bidder     BOOLEAN DEFAULT false,
    was_partner    BOOLEAN DEFAULT false,
    showed_trump   BOOLEAN DEFAULT false,
    one_last       BOOLEAN DEFAULT false,
    points_earned  INT NOT NULL,
    PRIMARY KEY (id)
)
