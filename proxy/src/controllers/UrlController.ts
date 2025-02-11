import * as cheerio from "cheerio";
import { IncomingMessage, ServerResponse } from "http";
import browser from "../browser.ts";
import { CACHE, CACHE_TTL } from "../server.ts";

export class UrlController {
  static async handle(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const fullPath = new URL(req.url!, `http://${req.headers.host}`).pathname;
    const targetUrl = decodeURIComponent(fullPath.split("/url/")[1]);

    res.setHeader("Content-Type", "application/json");

    if (!targetUrl) {
      res.end(JSON.stringify({ error: "Missing url parameter" }));
      return;
    }

    const cached = CACHE[targetUrl];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for ${targetUrl}`);
      res.end(JSON.stringify(cached));
      return;
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
      res.end(JSON.stringify({ error: err }));
    }
  }
}

const parseInfo = (html: string): string[] => {
  const $ = cheerio.load(html);
  return [
    ...new Set(
      $(".episodes.range a[data-base]")
        .get()
        .map((el) => $(el).attr("data-base")?.padStart(3, "0") ?? ""),
    ),
  ].sort();
};
