Palantarot
----------

A simple node backend with mysql and react/redux frontend to display and enter in French Tarot card game scores.

Deploying
---------

TODO

Development
-----------

There are a few things you will need to run the app locally.

Start up a mysql database:
```
docker-compose up -d
```

You will need to seed the database with the schema file `palantar_tarot.sql`.

Once your database is up and running, run the following commands:

```
yarn run start:app
yarn run watch:server
yarn run start:server
```

After that, you should have a server running on your machine. The frontend will update automatically, but any changes to the server will require a restart.
