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

async function getBrowserWSEndpoint() {
  let endpoint = await fs.readFile("./webSocketEndpoint.txt", {
    encoding: "utf-8",
  });
  return endpoint;
}

async function takeScreenshot(screenshotName = "default") {
  const mediaPath = `media/${screenshotName}-${new Date().getTime()}.png`;
  await page.screenshot({ path: mediaPath });
  console.log("screenshot saved at location: ", mediaPath);
}

async function sleepFor(seconds = 5) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}

async function scrapeURLFromPost(senderIdMappedName) {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  let url = "None";

  let browserWSEndpoint = await getBrowserWSEndpoint();
  let browser = await chromium.connect(browserWSEndpoint);
  let context = await browser.newContext();

  let page = "";

  if (fsSync.existsSync("./cookies.json")) {
    let cookies = await fs.readFile("./cookies.json", { encoding: "utf-8" });
    await context.addCookies(JSON.parse(cookies));
    page = await context.newPage();
  } else {
    page = await context.newPage();
    await page.goto("https://www.instagram.com/accounts/login");
    await page.getByLabel("Phone number, username, or email").click();
    await page.getByLabel("Phone number, username, or email").fill(username);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();

    await sleepFor(6);
    await takeScreenshot("trying-to-login");

    let cookies = await context.cookies("https://www.instagram.com");
    await saveCookiesLocally(cookies);
  }

  await page.goto("https://www.instagram.com/direct/inbox/");

  // try {
  //   console.time("Not Now Button");
  //   await page.getByRole("button", { name: "Not Now" }).click({timeout: 3000});
  //   console.timeEnd("Not Now Button");
  // } catch (error) {
  //   console.log('Button is not present on the page!');
  //   await page.screenshot({ path: 'media/error.png' });
  // }

  await page
    .getByRole("link", {
      name: `${senderIdMappedName}'s profile picture`,
      exact: true,
    })
    .click();

  // wait for loading the last media
  await sleepFor(2);

  await page.route("**/*", (route) => route.abort());

  const messageBoxElement = await page.getByPlaceholder("Message...");
  const { x, y } = await messageBoxElement.boundingBox();

  await page.evaluate(() => {
    document
      .getElementsByClassName("_ab5z _ab5_")[0]
      .scrollTo(
        0,
        document.getElementsByClassName("_ab5z _ab5_")[0].scrollHeight + 10000
      );
  });

  await page.mouse.click(x + 100, y - 150);

  await page.waitForURL(/https?:\/\/www\.instagram\.com\/(p|stories)\/*/);

  url = await page.url();
  await page.close();

  // await context.close();
  // await browser.close();

  return url;
}

module.exports = { getURLFromPost };
