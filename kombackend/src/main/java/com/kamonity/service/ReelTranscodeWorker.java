package com.kamonity.service;

import com.kamonity.model.MediaAsset;
import com.kamonity.repository.MediaAssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.file.*;

@Service
public class ReelTranscodeWorker {
 private final MediaAssetRepository media;
 @Value("${media.storage-dir:./uploads}") private String storageDir;
 @Value("${media.ffmpeg:ffmpeg}") private String ffmpeg;
 public ReelTranscodeWorker(MediaAssetRepository media){this.media=media;}
 @Async @Transactional public void transcode(Long assetId,String originalKey,double startSeconds,Double requestedEnd){
  MediaAsset asset=media.findById(assetId).orElse(null);if(asset==null)return;
  Path root=Path.of(storageDir),src=root.resolve(originalKey),dest=root.resolve(assetId+"-"+originalKey.hashCode()+".mp4"),poster=root.resolve(assetId+"-poster.jpg");
  try{
   double duration=requestedEnd==null?60:Math.min(60,requestedEnd-startSeconds);if(startSeconds<0||duration<=0||duration>60)throw new IllegalArgumentException("Trim interval must be between 0 and 60 seconds");
   Process p=new ProcessBuilder(ffmpeg,"-y","-ss",Double.toString(startSeconds),"-i",src.toString(),"-t",Double.toString(duration),"-vf","scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280","-c:v","libx264","-preset","medium","-crf","27","-c:a","aac","-b:a","128k","-movflags","+faststart",dest.toString()).redirectErrorStream(true).start();String log=new String(p.getInputStream().readAllBytes());if(p.waitFor()!=0)throw new IllegalStateException(log);
   Process thumb=new ProcessBuilder(ffmpeg,"-y","-i",dest.toString(),"-frames:v","1","-vf","scale=360:-2",poster.toString()).redirectErrorStream(true).start();String thumbLog=new String(thumb.getInputStream().readAllBytes());if(thumb.waitFor()!=0)throw new IllegalStateException(thumbLog);
   asset.complete(dest.getFileName().toString(),poster.getFileName().toString(),720,1280,duration);Files.deleteIfExists(src);
  }catch(Exception ex){try{Files.deleteIfExists(dest);Files.deleteIfExists(poster);}catch(Exception ignored){}asset.fail(ex.getMessage());}
 }
}
