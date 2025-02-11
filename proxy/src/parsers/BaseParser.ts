import { Vod } from "../models/Vod.ts";

export interface BaseParser {
  parse(html: string): { vod: Vod; episodes: string[] };
}
