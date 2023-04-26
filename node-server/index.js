"use strict";

const express = require("express"),
  bodyParser = require("body-parser"),
  app = express().use(bodyParser.json()), // creates express http server
  axios = require("axios"),
  fs = require("fs/promises"),
  { chromium } = require("playwright"),
  { getUrlFromMessageEntry } = require("./getUrlFromMessageEntry");

let lastTimeStamps = [];

(async () => {
  const browserServer = await chromium.launchServer();
  const browserWSEndpoint = browserServer.wsEndpoint();
  await fs.writeFile("./webSocketEndpoint.txt", browserWSEndpoint, {
    encoding: "utf-8",
  });
})();

// Imports dependencies and set up http server
app.post("/webhook", async (req, res) => {
  let body = req.body;
  // fs.writeFileSync('./receivedNativeObj.txt', JSON.stringify(body), { encoding: 'utf-8' });

  body.entry.forEach(async function (entry) {
    let webhook_event = entry.messaging[0];
    // console.log(webhook_event);
    console.log("received request!");

    // shortcode: p/alsdjfvasnd
    let currentTimeStamp = webhook_event["timestamp"];
    console.log("timestamp: ", currentTimeStamp);
    let senderid = webhook_event["sender"]["id"];

    if (!lastTimeStamps.includes(currentTimeStamp)) {
      console.log(lastTimeStamps);
      // when the 'if' condition of array containing a timestamp is false, proceess the request.
      lastTimeStamps.push(currentTimeStamp);

      let url = await getUrlFromMessageEntry(webhook_event, senderid);
      console.log(url, senderid);

      axios
        .post("http://localhost:5000/scrape", {
          url: url,
          senderid: senderid,
        })
        .then((res) => {
          console.log("success");
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (lastTimeStamps.length > 40) lastTimeStamps.shift();
  });
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "Yk8wgH2na*Fy";

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Sets server port and logs message on success4
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));
