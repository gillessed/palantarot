Setting up a Digital Ocean Droplet
----------------------------------

There are not many things required to setup the tarot server on a digital ocean.

1. Install Nodejs
2. Install postgresql
3. Update the database schema
4. Route port 80 to some other port
  * `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port PORT`