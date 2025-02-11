import { Vod } from "../models/Vod";

export interface BaseParser {
  parse(html: string): { vod: Vod; episodes: string[] };
}
