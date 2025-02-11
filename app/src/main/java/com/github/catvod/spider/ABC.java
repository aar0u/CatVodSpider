package com.github.catvod.spider;

import android.content.Context;

import com.github.catvod.bean.Result;
import com.github.catvod.bean.Vod;
import com.github.catvod.crawler.Spider;
import com.github.catvod.crawler.SpiderDebug;
import com.github.catvod.net.OkHttp;
import com.github.catvod.utils.Json;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ABC extends Spider {
    private static final String PROXY_URL = "http://192.168.31.171:3000/url/";
    private static final String DOMAIN = "https://123animehub.cc";

    public String siteUrl = "";

    @Override
    public void init(Context context, String extend) throws Exception {
        super.init(context, extend);
        this.siteUrl = extend;
    }

    private static void log(String msg) {
        SpiderDebug.log(msg);
        System.out.println(msg);
    }

    public String homeContent(boolean filter) {
        log("homeContent params: filter=" + filter);
        return OkHttp.string("http://192.168.31.171/file/home.json");
    }

    public String categoryContent(String tid, String pg, boolean filter, HashMap<String, String> extend) {
        log("categoryContent params: " + "tid=" + tid + ", pg=" + pg + ", filter=" + filter + ", extend=" + (extend != null ? extend.entrySet() : "null"));
        List<Vod> list = new ArrayList<>();
        return Result.string(list);
    }

    public String detailContent(List<String> ids) {
        log("detailContent params: ids=" + (ids != null ? ids.toString() : "null"));
        String showName = ids.get(0);
        String url = PROXY_URL + DOMAIN + showName;

        try {
            JsonObject jsonObject = Json.safeObject(OkHttp.string(url)).getAsJsonObject("info");
            Vod vod = new Gson().fromJson(jsonObject.get("vod"), Vod.class);

            StringBuilder vod_play_url = new StringBuilder();
            JsonArray episodes = jsonObject.getAsJsonArray("episodes");
            int total = episodes.size();
            vod_play_url.append("001").append("$").append(showName).append("#");
            for (int i = 1; i < total; i++) {
                String episode = episodes.get(i).getAsString();
                vod_play_url.append(episode).append("$").append(showName).append("/episode/").append(episode);

                if (i < total - 1) {
                    vod_play_url.append("#");
                } else {
                    vod_play_url.append("$$$");
                }
            }

            vod.setVodPlayFrom(this.getClass().getSimpleName() + "$$$");
            vod.setVodPlayUrl(vod_play_url.toString());
            return Result.string(vod);
        } catch (JsonSyntaxException | NullPointerException e) {
            log(e.toString());
        }
        return Result.string(new Vod());
    }

    public String searchContent(String key, boolean quick) {
        log("searchContent params: key=" + key + ", quick=" + quick);
        String html = OkHttp.string(DOMAIN + "/search?keyword=" + key);

        List<Vod> list = new ArrayList<>();
        try {
            Document doc = Jsoup.parse(html);

            for (Element item : doc.select("div.item")) {
                // 获取主要链接
                Element a = item.selectFirst("a[href^='/anime/']");
                if (a == null) continue;

                // 获取标题（优先data-jtitle，其次图片alt）
                String title = a.attr("data-jtitle");
                if (title.isEmpty()) {
                    Element img = item.selectFirst("img.lazyload");
                    title = img != null ? img.attr("alt") : "";
                }

                // 获取图片（优先data-src）
                String pic = "";
                Element img = item.selectFirst("img.lazyload");
                if (img != null) {
                    pic = img.hasAttr("data-src") ? img.attr("data-src") : img.attr("src");
                }

                // 获取集数和字幕类型
                Element epDiv = item.selectFirst("div.ep");
                Element subSpan = item.selectFirst("span.sub");

                String ep = epDiv != null ? epDiv.text().replaceAll("\n", "").trim() : "";
                String sub = subSpan != null ? subSpan.text() : "";

                // 构建数据
                Vod vod = new Vod();
                vod.setVodId(a.attr("href"));
                vod.setVodName(title);
                vod.setVodPic(DOMAIN + pic);
                vod.setVodRemarks(ep + " " + sub);
                list.add(vod);
            }
        } catch (Exception e) {
            log(e.toString());
        }

        return Result.string(list);
    }

    public String playerContent(String flag, String id, List<String> vipFlags) {
        log("playerContent params: " + "flag=" + flag + ", id=" + id + ", vipFlags=" + (vipFlags != null ? vipFlags.toString() : "null"));

        String url = PROXY_URL + DOMAIN + id;
        String videoUrl = "";
        try {
            JsonObject ret = Json.safeObject(OkHttp.string(url));
            log(url + ": " + ret);
            videoUrl = ret.get("url").getAsString();
        } catch (Exception e) {
            log(e.toString());
        }
        return Result.get().url(videoUrl).toString();
    }
}
