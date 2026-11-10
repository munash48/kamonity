package com.kamonity.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name="media_daily_views",uniqueConstraints=@UniqueConstraint(name="uk_media_view_session_day",columnNames={"media_asset_id","viewer_key","view_date"}))
public class MediaDailyView {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="media_asset_id",nullable=false) private MediaAsset asset;
 @Column(name="viewer_key",nullable=false,length=128) private String viewerKey;
 @Column(name="view_date",nullable=false) private LocalDate viewDate;
 protected MediaDailyView(){}
 public MediaDailyView(MediaAsset asset,String viewerKey,LocalDate date){this.asset=asset;this.viewerKey=viewerKey;this.viewDate=date;}
}
