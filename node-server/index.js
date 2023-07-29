"use strict";

import axios from "axios";
import PromptSync from "prompt-sync";
import getURLFromPost from "./getURLFromPost.js";
import "dotenv/config";

const username = process.env.IGUSERNAME;
const password = process.env.IGPASSWORD;
const senderName = process.env.SENDERNAME;
const prompt = PromptSync();

let isValid = false;

async function isValidUrl(url) {
  var urlRegex = /https:\/\/www.instagram.com\/p|story|reel\/*/i;
  return urlRegex.test(url);
}

(async function () {
  while (true) {
    const input = prompt("Type: ");
    if (input === "c") {
      let url = await getURLFromPost(username, password, senderName);
      console.log(url);
      isValid = await isValidUrl(url);
      if (isValid) {
        await axios
          .post("http://127.0.0.1:5000/scrape", {
            // replace the 'localhost' with your ip when running python server in a different VM.
            url
          })
          .then((res) => {
            console.log("success", res.status);
          })
          .catch((error) => {
            console.error(error.config);
          });
      } else {
        console.log("url can not be fetched.");
      }
    } else if (input === ".") process.exit(0);

    isValid = false;
  }
})();
