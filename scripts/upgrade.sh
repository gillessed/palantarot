#!/bin/sh

if [[ -z "$1" ]]; then
  echo "Usage: ./upgrade.sh palantarot.tar"
  exit 1;
fi

TARBALL=$1
scp -P 7822 $TARBALL palantar@palantarot.a2hosted.com:~

NAME=$(basename "$TARBALL")

ssh -p 7822 palantar@palantarot.a2hosted.com << EOF
  pkill node
  mkdir upgrade
  mv $NAME upgrade
  cd upgrade
  tar -xf $NAME

  rm -rf ../palantarot/app
  mv app ../palantarot

  rm -rf ../palantarot/index.html
  mv index.html ../palantarot

  rm -rf ../palantarot/package.json
  mv package.json ../palantarot

  rm -rf ../palantarot/server
  mv server ../palantarot

  rm -rf ../palantarot/static
  mv static ../palantarot

  cd ../
  rm -rf upgrade

  cd palantarot
  nohup node server/index.js > palantarot.log 2> palantarot.err < /dev/null &
  exit
EOF