#!/bin/sh

set -ex

cd "$(dirname "$0")"/..

rm -rf build

yarn
gulp compile
gulp compile-styles
gulp copy-static
time webpack --optimize-minimize

rm -rf dist
mkdir dist

cp -r build/* dist
cp package.json dist

cd dist
tar -cf palantarot.tar *

echo "Distribution tarball ready at dist/palantarot.tar"
