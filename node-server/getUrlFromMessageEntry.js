const { getURLFromPost } = require("./getURLFromPost");

async function getUrlFromMessageEntry(instagramBodyEntryObj, senderid) {
  let url = "No Url";

  if (instagramBodyEntryObj.message.text)
    // returns the url text that user has sent.
    url = instagramBodyEntryObj["message"]["text"];
  else url = await getURLFromPost(senderid);
  return url;
}

module.exports = { getUrlFromMessageEntry };
