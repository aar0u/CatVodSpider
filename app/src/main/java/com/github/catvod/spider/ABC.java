package com.github.catvod.spider;

import android.content.Context;

import com.github.catvod.bean.Result;
import com.github.catvod.bean.Vod;
import com.github.catvod.crawler.Spider;
import com.github.catvod.crawler.SpiderDebug;
import com.github.catvod.net.OkHttp;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ABC extends Spider {
    String domain = "https://123animehub.cc/";
    int lastEpisode = 56;
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
        String url = domain + "anime/" + showName;

        Document htmlDoc = Jsoup.parse(OkHttp.string(url));
        Vod vod = new Vod();
        vod.setVodId(showName);

        Element desc = htmlDoc.selectFirst("div.desc");
        if (desc != null) vod.setVodContent(desc.text().trim());

        // 处理meta信息
        Elements metaItems = htmlDoc.select("dl.meta > dt");
        for (Element dt : metaItems) {
            String key = dt.text().replace(":", "").trim();
            Element dd = dt.nextElementSibling();

            if (dd != null && dd.tagName().equals("dd")) {
                String value = dd.select("a").stream().map(Element::text).collect(Collectors.joining(", "));

                if (value.isEmpty()) value = dd.text().trim();

                switch (key) {
                    case "Type":
                        vod.setTypeName(value);
                        break;
                    case "Country":
                        vod.setVodArea(value);
                        break;
                    case "Released":
                        vod.setVodYear(value);
                        break;
                    case "Status":
                        vod.setVodRemarks(value);
                        break;
                    case "Genre":
                        vod.setVodTag(value);
                        break;
                }
            }
        }

        StringBuilder vod_play_url = new StringBuilder();
        for (int i = 1; i <= lastEpisode; i++) {
            String episode = String.format("%03d", i);
            vod_play_url.append(episode).append("$").append("anime/" + showName + "/episode/").append(episode);
            boolean notLastEpisode = i < lastEpisode;
            vod_play_url.append(notLastEpisode ? "#" : "$$$");
        }

        vod.setVodPlayFrom(this.getClass().getSimpleName() + "$$$");
        vod.setVodPlayUrl(vod_play_url.toString());
        return Result.string(vod);
    }

    public String searchContent(String key, boolean quick) {
        log("searchContent params: key=" + key + ", quick=" + quick);
        String string = OkHttp.string(domain + "search?keyword=" + key);
        return Result.string(new ArrayList<>());
    }

    public String playerContent(String flag, String id, List<String> vipFlags) {
        log("playerContent params: " + "flag=" + flag + ", id=" + id + ", vipFlags=" + (vipFlags != null ? vipFlags.toString() : "null"));

        String URL = "http://192.168.31.171:3000/?url=" +  domain + id;
        log(URL);
        String videoUrl = OkHttp.string(URL, getHeaders(URL));
        return Result.get().url(videoUrl).toString();
    }

    protected String UA(String url) {
        if (url.contains(".vod")) {
            return "okhttp/4.1.0";
        }
        return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
    }

    protected HashMap<String, String> getHeaders(String url) {
        HashMap<String, String> headers = new HashMap<>();
        headers.put("User-Agent", UA(url));
        headers.put("referer", domain);
        return headers;
    }
}
