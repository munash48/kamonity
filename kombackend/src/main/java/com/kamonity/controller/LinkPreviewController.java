package com.kamonity.controller;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@RestController
@RequestMapping("/api/v1")
public class LinkPreviewController {

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @PostMapping("/link-preview")
    public LinkPreviewResponse getLinkPreview(@RequestBody LinkPreviewRequest request) {
        String url = request.url();
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL is required");
        }

        try {
            new URI(url);
        } catch (URISyntaxException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid URL");
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", "Mozilla/5.0 (compatible; KOMMUNITY Bot/1.0)")
                    .GET()
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch URL");
            }

            String html = response.body();
            Document doc = Jsoup.parse(html, url);

            String title = doc.title();
            if (title == null || title.isBlank()) {
                title = doc.select("meta[property=\"og:title\"]").attr("content");
            }
            if (title == null || title.isBlank()) {
                title = doc.select("title").first() != null ? doc.select("title").first().text() : "";
            }

            String description = doc.select("meta[name=\"description\"]").attr("content");
            if (description == null || description.isBlank()) {
                description = doc.select("meta[property=\"og:description\"]").attr("content");
            }

            String image = doc.select("meta[property=\"og:image\"]").attr("content");
            if (image == null || image.isBlank()) {
                image = doc.select("img").first() != null ? doc.select("img").first().attr("src") : "";
            }

            return new LinkPreviewResponse(
                    title,
                    description,
                    image,
                    url
            );

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch link preview: " + e.getMessage());
        }
    }

    public record LinkPreviewRequest(String url) {}
    public record LinkPreviewResponse(String title, String description, String image, String url) {}
}