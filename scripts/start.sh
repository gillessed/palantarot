#!/bin/sh

ssh gcole@138.197.202.206 << EOF
    export NODE_ENV=production
    nohup node server.js > palantarot.log 2> palantarot.err < /dev/null &
EOF
