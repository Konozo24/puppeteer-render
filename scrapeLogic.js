const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
    // 1. Declare the browser variable up here so the 'finally' block can reach it
    let browser; 

    try {
        // 2. Move the launch INSIDE the try block
        browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
                "--disable-dev-shm-usage" // 3. CRITICAL for Docker/Render to prevent memory crashes
            ],
            // 4. Simplified path checking
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
        });

        const page = await browser.newPage();
        await page.goto('https://developer.chrome.com/');
        await page.setViewport({ width: 1080, height: 1024 });
        await page.keyboard.press('/');
        await page.locator('::-p-aria(Search)').fill('automate beyond recorder');
        await page.locator('.devsite-result-item-link').click();

        const textSelector = await page.locator('::-p-text(Customize and automate)').waitHandle();
        const fullTitle = await textSelector?.evaluate(el => el.textContent);

        const logStatement = `The title of this blog post is ${fullTitle}`;
        console.log(logStatement);
        res.send(logStatement);

    } catch (e) {
        console.error("Scraping Error:", e);
        // Now, if it crashes, you will see this in the browser instead of a 502 Gateway error
        res.status(500).send(`Something went wrong while scraping: ${e.message}`);
    } finally {
        // Ensure browser closes even if it crashes
        if (browser) await browser.close();
    }
}

module.exports = { scrapeLogic };