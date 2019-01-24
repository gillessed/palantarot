#!/bin/sh

set -ex

cd "$(dirname "$0")"/..

rm -rf build/*

yarn dist:app
yarn dist:server

cp package.json build

cd build
tar -cf palantarot.tar *

echo "Distribution tarball ready at build/palantarot.tar"
