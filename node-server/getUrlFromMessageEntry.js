const { getURLFromPost } = require("./getURLFromPost");

async function getUrlFromMessageEntry(instagramBodyEntryObj, senderid) {
  let url = "No Url";

  try {
    if (instagramBodyEntryObj.message.text)
    // returns the url text that user has sent.
    url = instagramBodyEntryObj["message"]["text"];
    else url = await getURLFromPost(senderid);
  } catch (error) {
    console.log(error);
  } finally {
    return url;
  }
}

module.exports = { getUrlFromMessageEntry };
