package com.kamonity.seed;

import com.kamonity.model.Post;
import com.kamonity.model.User;
import com.kamonity.repository.PostRepository;
import com.kamonity.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DemoDataSeeder implements ApplicationRunner {
    private final PostRepository posts;
    private final UserRepository usersRepo;
    private final JdbcTemplate jdbc;
    public DemoDataSeeder(PostRepository posts, UserRepository usersRepo, JdbcTemplate jdbc) { this.posts = posts; this.usersRepo = usersRepo; this.jdbc = jdbc; }

    @Override @Transactional
    public void run(ApplicationArguments args) {
        if (posts.count() > 0 || usersRepo.count() > 0) { syncUserPoints(); return; }
        List<String> names = List.of("Jamor Kamm", "Amina Nansubuga", "David Okello", "Grace Nakato", "Brian Mugisha", "Sarah Atim", "Peter Lwanga", "Ruth Namusoke", "Joseph Kato", "Mariam Achieng");
        List<String> topics = List.of("Building stronger communities starts with listening.", "What is one lesson you learned this week?", "Small steps and shared ideas make lasting progress.", "Let us support local founders and create opportunities.", "Learning together makes every success more meaningful.");
        for (int u = 0; u < names.size(); u++) {
            String name = names.get(u);
            usersRepo.save(new User(name, "member" + (u + 1) + "@demo.kommunity.local"));
            for (int n = 0; n < 10; n++) {
                int points = (u == 0 ? 30 : Math.max(5, 24 - u * 2)) + (9 - n);
                posts.save(new Post(name, topics.get((u + n) % topics.size()) + " #KOMMUNITY #BuildTogether", points, points * 2, n % 7, n % 4, LocalDateTime.now().minusMinutes((u * 10L + n) * 37)));
            }
        }
        syncUserPoints();
    }

    private void syncUserPoints() {
        jdbc.update("UPDATE users u SET points = COALESCE((SELECT SUM(p.points) FROM posts p WHERE p.author_name = u.name), 0)");
    }
}
