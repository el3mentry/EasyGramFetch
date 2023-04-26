const { chromium } = require("playwright");
require("dotenv").config();
const fs = require("fs/promises");
const fsSync = require("fs");

function getURLFromPost(senderid) {
  let senderIdMappedName = process.env[`${senderid}`];
  let url = scrapeURLFromPost(senderIdMappedName);
  return url;
}

async function saveCookiesLocally(cookies) {
  await fs.writeFile("./cookies.json", JSON.stringify(cookies), {
    encoding: "utf-8",
  });
}

async function scrapeURLFromPost(senderIdMappedName) {
  console.log(senderIdMappedName);

  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  let url = "None";

  // console.time("Chrome Launch");
  let browser = await chromium.launch();
  let context = await browser.newContext();
  let page = "";
  // console.timeEnd("Chrome Launch");

  if (fsSync.existsSync("./cookies.json")) {
    // console.time("Cookies Fetch");
    let cookies = await fs.readFile("./cookies.json", { encoding: "utf-8" });
    await context.addCookies(JSON.parse(cookies));
    page = await context.newPage();
    // console.timeEnd("Cookies Fetch");
  } else {
    console.log("trying to perform login...");
    page = await context.newPage();
    await page.goto("https://www.instagram.com/accounts/login");
    await page.getByLabel("Phone number, username, or email").click();
    await page.getByLabel("Phone number, username, or email").fill(username);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();

    await new Promise((r) => setTimeout(r, 6000));

    let cookies = await context.cookies("https://www.instagram.com");
    await saveCookiesLocally(cookies);
  }

  // console.time("Going to Inbox");
  await page.goto("https://www.instagram.com/direct/inbox/");
  // await page.screenshot({ path: "media/inbox.png" });
  // await new Promise((r) => setTimeout(r, 3000));
  // console.timeEnd("Going to Inbox");

  // await page.screenshot({ path: 'media/notnow.png' });
  // try {
  //   console.time("Not Now Button");
  //   await page.getByRole("button", { name: "Not Now" }).click({timeout: 3000});
  //   console.timeEnd("Not Now Button");
  // } catch (error) {
  //   console.log('Button is not present on the page!');
  //   await page.screenshot({ path: 'media/error.png' });
  // }

  // console.time("Profile Picture");
  await page
    .getByRole("link", {
      name: `${senderIdMappedName}'s profile picture`,
      exact: true,
    })
    .click();

  // wait for loading the last media
  await new Promise((r) => setTimeout(r, 2000));
  // console.timeEnd("Profile Picture");

  // await context.setOffline(true);
  // console.time("Internet Block");
  await page.route("**/*", (route) => route.abort());
  // console.log("internet blocked");

  // console.timeEnd("Internet Block");

  // console.time("Message Box");
  const messageBoxElement = await page.getByPlaceholder("Message...");
  const { x, y } = await messageBoxElement.boundingBox();
  // console.timeEnd("Message Box");

  // console.log("trying to scroll!");

  // console.time("evaluate");
  await page.evaluate(() => {
    document
      .getElementsByClassName("_ab5z _ab5_")[0]
      .scrollTo(
        0,
        document.getElementsByClassName("_ab5z _ab5_")[0].scrollHeight + 10000
      );
  });
  // console.timeEnd("evaluate");

  // console.time("MouseClick");
  // await page.screenshot({ path: `media/inbox-${new Date().getTime()}.png` });
  await page.mouse.click(x + 100, y - 150);
  // console.timeEnd("MouseClick");

  // console.time("Url");
  await page.waitForURL(/https?:\/\/www\.instagram\.com\/(p|stories)\/*/);
  // await new Promise((r) => setTimeout(r, 5000));
  // await page.screenshot({ path: "media/regex.png" });

  url = await page.url();
  // console.timeEnd("Url");

  // console.time("close");
  await page.close();
  await context.close();
  await browser.close();
  // console.timeEnd("close");

  return url;
}

module.exports = { getURLFromPost };
