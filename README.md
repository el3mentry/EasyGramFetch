# Purpose

To download all types of Instagram media objects on request from the user, just by sharing the post to an account, and store them in a Discord server in the fastest way possible.


# Pipeline


(**PLEASE CHECK THE WIKI FOR DETAILED STEPS ON SETTING UP THE SERVICE : [WIKI](https://github.com/rhitabratakarar/EasyGramFetch/wiki)**)

- user sends an Instagram media object using the share / direct button to a IG business account, account receives the post as a message and is configured to send the received message from the user as a POST request to a domain connected to a Virtual Machine. The IG account is configured by setting up an app in `developers.facebook.com`.
- message is received by the apache2 server actively running on the VM, which redirects all traffic to a NodeJS server.
- the NodeJS server parses the message and extracts the permalink from it. (and other useful information).
- the permalink is then redirected to a Python Flask server which employs another Instagram account which operates as a bot to properly access the permalink and run instructions to scrape the media source URL.
- media file is generated from the scraped source URL.
- using the Discord Webhook integration which gives a URl for a text channel in a Discord server, the generated file is then posted to the channel.
