package com.kamonity.repository;
import com.kamonity.model.DailyPostAward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
public interface DailyPostAwardRepository extends JpaRepository<DailyPostAward,Long>{ boolean existsByAwardDate(LocalDate date); }
