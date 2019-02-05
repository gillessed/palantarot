#!/bin/sh

if [[ -z "$1" ]]; then
  echo "Usage: ./upgrade.sh palantarot.tar"
  exit 1;
fi

TARBALL=$1

scp $TARBALL gcole@138.197.202.206:~

NAME=$(basename "$TARBALL")

ssh gcole@138.197.202.206 << EOF

    mkdir -p palantarot
    mkdir -p backup

    pkill node
    rm backup/*
    mv palantarot/config.json backup/config.json
    mv palantarot/node_modules backup/node_modules
    rm -rf palantarot/*
    mv $NAME palantarot
    cd palantarot
    tar -xf $NAME

    mv ../backup/config.json .
    mv ../backup/node_modules .

    npm install
    export NODE_ENV=production
    nohup node server.js > palantarot.log 2> palantarot.err < /dev/null &
EOF
