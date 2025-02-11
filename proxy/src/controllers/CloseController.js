import { closeBrowser } from "../browser.js";

export class CloseController {
  static handle(req, res) {
    try {
      closeBrowser();
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Browser closed successfully");
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Error closing browser: ${err.message}`);
    }
  }
}
