#!/bin/sh

ssh gcole@138.197.202.206 << EOF

    export NODE_ENV=production
    nohup node server.js > /dev/null &
EOF
