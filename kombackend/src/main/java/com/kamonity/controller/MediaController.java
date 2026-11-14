package com.kamonity.controller;

import com.kamonity.model.*;
import com.kamonity.repository.*;
import com.kamonity.service.ReelTranscodeWorker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {
    private final UserRepository users;
    private final MediaAssetRepository media;
    private final MediaDailyViewRepository views;
    private final ReelTranscodeWorker transcoder;

    @Value("${media.storage-dir:./uploads}")
    private String storage;

    @Value("${media.ffmpeg:ffmpeg}")
    private String ffmpeg;

    public MediaController(UserRepository users, MediaAssetRepository media, MediaDailyViewRepository views, ReelTranscodeWorker transcoder) {
        this.users = users;
        this.media = media;
        this.views = views;
        this.transcoder = transcoder;
    }

    @PostMapping("/upload")
    public MediaResponse upload(
            @RequestParam Long userId,
            @RequestParam String kind,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "0") double trimStartSeconds,
            @RequestParam(required = false) Double trimEndSeconds
    ) {
        User owner = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean photo = "photo".equalsIgnoreCase(kind);
        boolean reel = "reel".equalsIgnoreCase(kind);

        if (!photo && !reel) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose photo or reel");
        }

        String mime = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        long maxSizeBytes = photo ? 10L * 1024 * 1024 : 100L * 1024 * 1024;

        if (file.getSize() > maxSizeBytes) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    photo ? "Photos must be at most 10 MB" : "Reels must be at most 100 MB");
        }

        if (photo) {
            List<String> validImageTypes = List.of("image/jpeg", "image/png", "image/webp");
            if (!validImageTypes.contains(mime)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photos must be JPEG, PNG, or WebP");
            }
        }

        if (reel) {
            List<String> validVideoTypes = List.of("video/mp4", "video/quicktime", "video/webm");
            if (!validVideoTypes.contains(mime)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reels must be MP4, MOV, or WebM");
            }
            if (trimStartSeconds < 0 || (trimEndSeconds != null && (trimEndSeconds <= trimStartSeconds || trimEndSeconds - trimStartSeconds > 60))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reel trim range must be at most 60 seconds");
            }
        }

        try {
            byte[] bytes = file.getBytes();
            Path storagePath = Path.of(storage).toAbsolutePath().normalize();
            Files.createDirectories(storagePath);

            String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            String extension = "";
            if (mime.equals("video/quicktime")) extension = ".mov";
            else if (mime.equals("video/webm")) extension = ".webm";
            else if (photo) extension = ".img";
            else extension = ".mp4";

            String sourceKey = hash + "-source" + extension;

            Path source = storagePath.resolve(sourceKey);
            Files.write(source, bytes, StandardOpenOption.CREATE_NEW);

            String originalFilename = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
            MediaAsset asset = media.save(new MediaAsset(owner, photo ? "PHOTO" : "REEL", sourceKey, originalFilename, mime, "PROCESSING"));

            if (photo) {
                processPhoto(asset, source);
            } else {
                transcoder.transcode(asset.getId(), sourceKey, trimStartSeconds, trimEndSeconds);
            }

            return dto(asset);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Media upload failed: " + e.getMessage());
        }
    }

    private void processPhoto(MediaAsset asset, Path source) throws Exception {
        BufferedImage input = ImageIO.read(source.toFile());
        if (input == null) {
            asset.fail("Unsupported image data");
            media.save(asset);
            return;
        }

        double factor = Math.min(1d, 1080d / Math.max(input.getWidth(), input.getHeight()));
        int w = Math.max(1, (int) Math.round(input.getWidth() * factor));
        int h = Math.max(1, (int) Math.round(input.getHeight() * factor));

        BufferedImage output = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = output.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.drawImage(input, 0, 0, w, h, Color.WHITE, null);
        g.dispose();

        Path storagePath = Path.of(storage).toAbsolutePath().normalize();
        String outputKey = asset.getId() + "-" + asset.getStorageKey().substring(0, Math.min(24, asset.getStorageKey().length())) + ".jpg";
        ImageIO.write(output, "jpg", storagePath.resolve(outputKey).toFile());
        Files.deleteIfExists(source);

        asset.complete(outputKey, null, w, h, null);
        media.save(asset);
    }

    @GetMapping("/feed")
    public List<MediaResponse> feed() {
        return media.findAllByStatusOrderByCreatedAtDesc("READY").stream()
                .filter(a -> a.getMediaType().equals("REEL"))
                .map(this::dto)
                .toList();
    }

    @GetMapping("/{id}")
    public MediaResponse get(@PathVariable Long id) {
        return media.findById(id).map(this::dto).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<java.util.Map<String, Boolean>> view(
            @PathVariable Long id,
            @RequestHeader(value = "X-Viewer-Session", required = false) String session
    ) {
        if (!media.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        String key = session == null || session.isBlank() ? "guest" : session.substring(0, Math.min(120, session.length()));
        views.insertIfAbsent(id, key, LocalDate.now());
        return ResponseEntity.ok(java.util.Map.of("accepted", true));
    }

    @GetMapping("/files/{key}")
    public ResponseEntity<Resource> file(@PathVariable String key) {
        if (key.contains("..") || key.contains("/") || key.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        Path storagePath = Path.of(storage).toAbsolutePath().normalize();
        Path path = storagePath.resolve(key).normalize();
        if (!Files.exists(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(365)).cachePublic().immutable())
                .body(new FileSystemResource(path));
    }

    private MediaResponse dto(MediaAsset a) {
        return new MediaResponse(
                a.getId(),
                a.getMediaType(),
                a.getStatus(),
                "/api/v1/media/files/" + a.getStorageKey(),
                a.getPosterKey() == null ? null : "/api/v1/media/files/" + a.getPosterKey(),
                a.getWidth(),
                a.getHeight(),
                a.getDurationSeconds(),
                a.getFailureReason()
        );
    }

    public record MediaResponse(
            Long id,
            String type,
            String status,
            String url,
            String posterUrl,
            Integer width,
            Integer height,
            Double durationSeconds,
            String failureReason
    ) {}
}