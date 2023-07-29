import { chromium } from "playwright";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";

export default async function getURLFromPost(username, password, senderName) {
  let url = "";
  try {
    url = await scrapeURLFromPost(username, password, senderName);
  } catch (error) {
    console.log(error);
  } finally {
    return url;
  }
}

async function saveCookiesLocally(cookies) {
  await writeFile("./cookies.json", JSON.stringify(cookies), {
    encoding: "utf-8",
  });
}

async function takeScreenshotWithoutDate(page, screenshotName = "default") {
  const mediaPath = `./media/${screenshotName}.png`;
  await page.screenshot({ path: mediaPath });
  console.log("screenshot saved at location: ", mediaPath);
}

async function takeScreenshot(page, screenshotName = "default") {
  const mediaPath = `media/${screenshotName}-${new Date().getTime()}.png`;
  await page.screenshot({ path: mediaPath });
  console.log("screenshot saved at location: ", mediaPath);
}

async function sleepFor(seconds = 5) {
  await new Promise((r) => setTimeout(r, seconds * 1000));
}

async function scrapeURLFromPost(username, password, senderName) {
  let url = "";
  let browser = await chromium.launch({ headless: true });
  let context = await browser.newContext();
  if (browser) console.log("browser connected");

  let page = "";

  if (existsSync("./cookies.json")) {
    let cookies = await readFile("./cookies.json", { encoding: "utf-8" });
    await context.addCookies(JSON.parse(cookies));
    page = await context.newPage();
    console.log("had existing cookies");
  } else {
    console.log("trying to login");
    page = await context.newPage();
    await page.goto("https://www.instagram.com/accounts/login");
    await page.getByLabel("Phone number, username, or email").click();
    await page.getByLabel("Phone number, username, or email").fill(username);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();

    await sleepFor(6);
    await takeScreenshot(page, "trying-to-login");

    let cookies = await context.cookies("https://www.instagram.com");
    await saveCookiesLocally(cookies);
    console.log("cookies saved locally.");
  }

  await page.goto("https://www.instagram.com/direct/inbox/");
  await takeScreenshotWithoutDate(page, "inbox");

  // try {
  //   console.time("Not Now Button");
  //   await page.getByRole("button", { name: "Not Now" }).click({timeout: 3000});
  //   console.timeEnd("Not Now Button");
  // } catch (error) {
  //   console.log('Button is not present on the page!');
  //   await page.screenshot({ path: 'media/error.png' });
  // }

  await page
    .getByRole("button", {
      name: `User avatar ${senderName}`,
    })
    .click();

  await page.waitForLoadState("networkidle");

  await page.route("**/*", (route) => route.abort());

  const messageBoxElement = await page.getByRole("paragraph");
  const { x, y } = await messageBoxElement.boundingBox();

  await page.mouse.wheel(0, 10000);

  await page.mouse.click(x + 100, y - 150);

  await page.waitForURL(/https?:\/\/www\.instagram\.com\/(p|stories)\/*/);

  url = await page.url();
  await page.close();
  await context.close();

  return url;
}
