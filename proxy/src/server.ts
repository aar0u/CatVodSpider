import { createServer } from "http";
import { UrlController } from "./controllers/UrlController.ts";
import { CloseController } from "./controllers/CloseController.ts";

interface CacheItem {
  url: string;
  info: string[];
  timestamp: number;
}

export const CACHE: Record<string, CacheItem> = {};
export const TIME_UNITS = {
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};
export const CACHE_TTL = 2 * TIME_UNITS.HOUR;

const server = createServer(async (req, res) => {
  const route = new URL(req.url!, `http://${req.headers.host}`).pathname;

  if (route.startsWith("/url/")) {
    await UrlController.handle(req, res);
  } else if (route === "/closebrowser") {
    CloseController.handle(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
