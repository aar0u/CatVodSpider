import * as cheerio from "cheerio";

import { BaseParser } from "./BaseParser";
import { Vod } from "../models/Vod";

export class Parser123Anime implements BaseParser {
  parse(html: string): { vod: Vod; episodes: string[] } {
    const $ = cheerio.load(html);

    const vod = new Vod();
    const desc = $("div.desc").first();
    if (desc.length > 0) {
      vod.vodContent = desc
        .text()
        .replace(/\t/g, " ")
        .replace(/\s{2,}/g, " ") // 将多个连续空格替换为单个空格
        .replace(/More$/, "") // 去掉末尾的 "More"
        .trim();
    }

    // Process meta information
    const metaItems = $("dl.meta > dt");
    metaItems.each((_, dt) => {
      const key = $(dt).text().replace(":", "").trim();
      const dd = $(dt).next();

      if (dd.length > 0 && dd.prop("tagName") === "DD") {
        let value = dd
          .find("a")
          .map((_, a) => $(a).text())
          .get()
          .join(", ");

        if (!value) {
          value = dd.text().trim();
        }

        switch (key) {
          case "Type":
            vod.typeName = value;
            break;
          case "Country":
            vod.vodArea = value;
            break;
          case "Released":
            vod.vodYear = value;
            break;
          case "Status":
            vod.vodRemarks = value;
            break;
          case "Genre":
            vod.vodTag = value;
            break;
        }
      }
    });

    const episodes = [
      ...new Set(
        $(".episodes.range a[data-base]")
          .get()
          .map((el) => $(el).attr("data-base")?.padStart(3, "0") ?? ""),
      ),
    ].sort((a, b) => parseInt(a) - parseInt(b));

    return { vod, episodes };
  }
}
