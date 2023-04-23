const { chromium } = require('playwright');
require('dotenv').config();
const fs = require('fs/promises');
const fsSync = require('fs');

function getURLFromPost(senderid) {
    let senderIdMappedName = process.env[`${senderid}`];
    let url = scrapeURLFromPost(senderIdMappedName);
    return url;
}

async function saveCookiesLocally(cookies) {
    await fs.writeFile('./cookies.json', JSON.stringify(cookies), { encoding: 'utf-8' });
}

async function scrapeURLFromPost(senderIdMappedName) {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
    let url = 'NOTHING';

    let browser = await chromium.launch();
    let context = await browser.newContext();
    let page = '';

    if (fsSync.existsSync('./cookies.json')) {
        let cookies = await fs.readFile('./cookies.json', { encoding: 'utf-8' });
        await context.addCookies(JSON.parse(cookies));
        page = await context.newPage();
    }
    else {
        page = await context.newPage();
        await page.goto('https://www.instagram.com/');
        await page.getByLabel('Phone number, username, or email').click();
        await page.getByLabel('Phone number, username, or email').fill(username);
        await page.getByLabel('Password').click();
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: 'Log in', exact: true }).click();

        await page.screenshot({ path: 'media/filled.png' });

        await new Promise(r => setTimeout(r, 15000));
        await page.screenshot({ path: 'media/filled2.png' });

        let cookies = await context.cookies("https://www.instagram.com");

        // await saveCookiesLocally(cookies);
    }

    await page.goto('https://www.instagram.com/direct/inbox/');
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'media/inbox.png' });

    try {
        await page.getByRole('button', { name: 'Not Now' }).click();
    }
    catch (error) {
        console.log('Button is not present on the page!');
        await page.screenshot({ path: 'media/error.png' });
    }

    await page.getByRole('link', {
        name: `${senderIdMappedName}\'s profile picture`, exact: false
    }).click();

    await page.locator('._acfr').nth(-1).click();
    await new Promise(r => setTimeout(r, 3000));
    url = await page.url();

    await context.close();
    await browser.close();

    return url;
}

module.exports = { getURLFromPost }