#!/bin/sh

if [[ -z "$1" ]]; then
  echo "Usage: ./seed.sh [SQL_FILE]"
  exit 1;
fi

SQL_FILE=$1

scp $SQL_FILE gcole@138.197.202.206:~

NAME=$(basename "$SQL_FILE")

ssh gcole@138.197.202.206 << EOF
    psql -d tarot_data -a -f $NAME
EOF
