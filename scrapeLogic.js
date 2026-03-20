const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
    });
    try {
        // Launch the browser and open a new blank page.
        const page = await browser.newPage();

        // Navigate the page to a URL.
        await page.goto('https://developer.chrome.com/');

        // Set screen size.
        await page.setViewport({ width: 1080, height: 1024 });

        // Open the search menu using the keyboard.
        await page.keyboard.press('/');

        // Type into search box using accessible input name.
        await page.locator('::-p-aria(Search)').fill('automate beyond recorder');

        // Wait and click on first result.
        await page.locator('.devsite-result-item-link').click();

        // Locate the full title with a unique string.
        const textSelector = await page
            .locator('::-p-text(Customize and automate)')
            .waitHandle();
        const fullTitle = await textSelector?.evaluate(el => el.textContent);

        // Print the full title.
        const logStatement = `The title of this blog post is ${fullTitle}`;
        console.log(logStatement);
        res.send(logStatement);
    } catch (e) {
        console.error(e);
        res.send("Something went wrong when running Puppeteer");
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { scrapeLogic };