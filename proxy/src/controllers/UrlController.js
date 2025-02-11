import browser from "../browser.js";
import { CACHE, CACHE_TTL } from "../server.js";
import * as cheerio from "cheerio";

export class UrlController {
  static async handle(req, res) {
    const fullPath = new URL(req.url, `http://${req.headers.host}`).pathname;
    const targetUrl = decodeURIComponent(fullPath.split("/url/")[1]);

    res.setHeader("Content-Type", "application/json");

    if (!targetUrl) {
      return res.end({ error: "Missing url parameter" });
    }

    const cached = CACHE[targetUrl];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for ${targetUrl}`);
      return res.end(JSON.stringify(cached));
    }

    try {
      await browser(targetUrl, (data) => {
        CACHE[targetUrl] = {
          url: data.url,
          info: parseInfo(data.dom),
          timestamp: Date.now(),
        };
        res.end(JSON.stringify(CACHE[targetUrl]));
      });
    } catch (err) {
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

const parseInfo = (html) => {
  const $ = cheerio.load(html);
  return [
    ...new Set(
      $(".episodes.range a[data-base]")
        .get()
        .map((el) => $(el).attr("data-base").padStart(3, "0"))
    ),
  ].sort();
};
