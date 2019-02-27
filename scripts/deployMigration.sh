#!/bin/sh

scp -P 7822 migrationBuild/mysqlDump.js palantar@a2ss47.a2hosting.com:~/palantarot
scp migrationBuild/psqlIngest.js gcole@138.197.202.206:~/palantarot
