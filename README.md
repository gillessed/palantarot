Palantarot
----------

A simple node backend with mysql and react/redux frontend to display and enter in French Tarot card game scores.

Deploying
---------

TODO

Development
-----------

To run the server locally, you first need a mysql. I haven't any docker stuff for this. I'm not doing that.

Then there are three commands to run, all in the package.json:

```
yarn run gulp
yarn run webpack
yarn run server
```

After that, you should have a server running on your machine. All the commands will watch for changes. The server will restart automatically, but I didn't do anything with hotloading on the frontend, so you'll have to refresh that.