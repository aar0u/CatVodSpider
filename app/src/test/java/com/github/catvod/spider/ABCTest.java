package com.github.catvod.spider;

import android.app.Application;

import com.github.catvod.crawler.Spider;
import com.github.catvod.utils.Json;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;

import java.util.ArrayList;
import java.util.List;

@RunWith(RobolectricTestRunner.class)
public class ABCTest {
    @Mock
    private Application mockContext;

    private Spider spider;

    @Before
    public void setUp() throws Exception {
        mockContext = RuntimeEnvironment.getApplication();
        Init.init(mockContext);
        spider = new ABC();
        spider.init(mockContext, "");
    }

    @Test
    public void homeContent() throws Exception {
        String content = spider.homeContent(true);
        JsonObject map = Json.safeObject(content);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println("homeContent--" + gson.toJson(map));
        Assert.assertFalse(map.getAsJsonArray("list").isEmpty());
    }

    @Test
    public void searchContent() throws Exception {
        String content = spider.searchContent("one piece", false);
        JsonObject map = Json.safeObject(content);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println("searchContent--" + gson.toJson(map));
        Assert.assertFalse(map.getAsJsonArray("list").isEmpty());
    }

    @Test
    public void detailContent() throws Exception {
        String content = spider.detailContent(List.of("/anime/one-piece-dub"));
        JsonObject map = Json.safeObject(content);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println("detailContent--" + gson.toJson(map));
        Assert.assertFalse(map.getAsJsonArray("list").isEmpty());
    }

    @Test
    public void playerContent() throws Exception {
        String content = spider.playerContent("ABC", "/anime/pokemon-2023-dub/episode/005", new ArrayList<>());
        JsonObject map = Json.safeObject(content);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println("playerContent--" + gson.toJson(map));
        Assert.assertFalse(map.getAsJsonPrimitive("url").getAsString().isEmpty());
    }

    @Test
    public void categoryContent() throws Exception {
        String content = spider.categoryContent("/type/1.html", "2", true, null);
        JsonObject map = Json.safeObject(content);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println("categoryContent--" + gson.toJson(map));
        Assert.assertTrue(map.getAsJsonArray("list").isEmpty());
    }
}