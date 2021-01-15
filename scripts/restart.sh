#!/bin/sh

ssh gcole@138.197.202.206 << EOF
    export NODE_ENV=production
    pm2 restart start
EOF
