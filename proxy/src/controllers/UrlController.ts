import { IncomingMessage, ServerResponse } from "http";

import browser from "../browser";
import { CACHE, CACHE_TTL } from "../cache/cache";
import { parserFactory } from "../parsers/parserFactory";

export const urlController = {
  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!req.url || !req.headers.host) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Invalid request" }));
      return;
    }

    const fullPath = new URL(req.url, `http://${req.headers.host}`).pathname;
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
      const parser = parserFactory.createParser(targetUrl);
      await browser(targetUrl, (data) => {
        CACHE[targetUrl] = {
          url: data.url,
          info: parser.parse(data.dom),
          timestamp: Date.now(),
        };
        res.end(JSON.stringify(CACHE[targetUrl]));
      });
    } catch (err) {
      res.end(JSON.stringify({ error: err }));
    }
  },
};
