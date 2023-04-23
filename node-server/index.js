'use strict';
// const fs = require('fs');
const { getUrlFromMessageEntry } = require('./getUrlFromMessageEntry');

const
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json()), // creates express http server
    axios = require('axios');

let lastTimeStamps = [];

// Imports dependencies and set up http server
app.post('/webhook', async (req, res) => {
    let body = req.body;
    // fs.writeFileSync('./receivedNativeObj.txt', JSON.stringify(body), { encoding: 'utf-8' });
    
    body.entry.forEach(async function (entry) {
        let webhook_event = entry.messaging[0];
        // console.log(webhook_event);

        // shortcode: p/alsdjfvasnd
        let currentTimeStamp = webhook_event['timestamp'];
        let senderid = webhook_event['sender']['id'];

        if (lastTimeStamps.includes(currentTimeStamp) == false) {
            // when the 'if' condition of array containing a timestamp is false, proceess the request.
            let url = await getUrlFromMessageEntry(webhook_event, senderid);
            console.log(url);
            
            /*axios.post('http://localhost:5000/scrape',
                {
                    url: url,
                    senderid: senderid
                })
                .then(res => {
                    console.log('success');
                })
                .catch(error => {
                    console.error(error);
                }); */
        }

        if (lastTimeStamps.length > 40)
            lastTimeStamps.shift();

        lastTimeStamps.push(currentTimeStamp);
    }
    );
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "Yk8wgH2na*Fy"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));