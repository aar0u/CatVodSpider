import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;
let lastAccessTime = Date.now();
let timeoutId: NodeJS.Timeout | null = null;

const MIN = 60 * 1000;
const TIMEOUT = 20 * MIN;
const TIMEOUT_PAGE = 2 * MIN;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    console.log("Browser launched");
  }
  lastAccessTime = Date.now();
  startTimeoutCheck();
  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
  if (timeoutId) {
    clearInterval(timeoutId);
    timeoutId = null;
  }
}

function startTimeoutCheck() {
  if (timeoutId) return;
  timeoutId = setInterval(async () => {
    if (Date.now() - lastAccessTime > TIMEOUT) {
      console.log("Closing browser due to inactivity");
      await closeBrowser();
    }
  }, 60000); // 每分钟检查一次
}

export default async function (
  url: string,
  onMediaFound: (_: { url: string; dom: string }) => void,
) {
  const browser = await getBrowser();
  const page: Page = await browser.newPage();

  try {
    // await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    page.on("response", async (response) => {
      try {
        if (response.url().endsWith("m3u8")) {
          onMediaFound({
            url: response.url(),
            dom: await page.content(),
          });
          console.log(`Captured ${response.url()}`);
          if (!page.isClosed()) {
            page.close();
          }
        }
      } catch (error) {
        console.error(`Error on capturing: ${error}`);
      }
    });

    console.log(`Navigate to ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
  } catch (error) {
    console.error(`Error on browser: ${error}`);
  }

  setTimeout(async () => {
    if (!page.isClosed()) {
      console.log(`Force closing page after ${TIMEOUT_PAGE}ms`);
      await page.close().catch(() => {});
    }
  }, TIMEOUT_PAGE);
}
