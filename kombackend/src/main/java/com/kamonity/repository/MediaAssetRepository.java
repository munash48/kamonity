package com.kamonity.repository;
import com.kamonity.model.MediaAsset;import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;
public interface MediaAssetRepository extends JpaRepository<MediaAsset,Long>{List<MediaAsset> findAllByStatusOrderByCreatedAtDesc(String status);}
