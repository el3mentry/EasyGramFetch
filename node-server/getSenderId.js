"use strict";

const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", async (req, res) => {
  let body = req.body;

  body.entry.forEach(async function (entry) {
    let webhook_event = entry.messaging[0];

    let senderid = webhook_event["sender"]["id"];
    console.log(senderid);
  });
});

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening for new senderID"));
