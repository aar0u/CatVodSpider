import puppeteer from 'puppeteer';

let browserInstance = null;

async function launchBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: false,
            args: [
                "--disable-blink-features=AutomationControlled",
            ]
        });
        console.log('Browser launched');
    }
    return browserInstance;
}

export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

export default async function (url, onComplete) {
    const browser = await launchBrowser();
    const page = await browser.newPage();

    try {
        // await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        page.on('response', async (response) => {
            try {
                onComplete({
                    url: response.url(),
                    dom: await page.content()
                })
                // if (response.url().endsWith('m3u8')) {
                //     onMediaFound(response.url())
                //     console.log(`Captured ${response.url()}`);
                //     page.close();
                // }
                page.close();
                console.log(`Closed page`);
            } catch (error) {
                console.error(`Error on capturing: ${error}`);
            }
        });
        console.log(`Navigate to ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
    } catch (error) {
        console.error(`Error on browser: ${error}`);
    }
}
