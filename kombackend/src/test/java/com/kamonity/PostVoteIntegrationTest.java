package com.kamonity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = KomBackendApplication.class)
@AutoConfigureMockMvc
@TestPropertySource(properties={"spring.datasource.url=jdbc:h2:mem:vote-test;MODE=MySQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false"})
class PostVoteIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc;
 @Test void userCanVoteOnlyOnceAndPointsAndAuditAreRecorded() throws Exception {
   String posts=mvc.perform(get("/api/v1/posts")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
   JsonNode post=json.readTree(posts).get(0); long postId=post.get("id").asLong(); long before=jdbc.queryForObject("SELECT points FROM users WHERE name=?",Long.class,post.get("authorName").asText());
   String users=mvc.perform(get("/api/v1/users")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(); long voter=json.readTree(users).get(0).get("id").asLong();
   String body="{\"userId\":"+voter+"}";
   mvc.perform(post("/api/v1/posts/"+postId+"/vote").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
   mvc.perform(post("/api/v1/posts/"+postId+"/vote").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
   org.junit.jupiter.api.Assertions.assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM post_votes WHERE user_id=? AND post_id=?",Integer.class,voter,postId));
   org.junit.jupiter.api.Assertions.assertEquals(before+1,jdbc.queryForObject("SELECT points FROM users WHERE name=?",Long.class,post.get("authorName").asText()));
   org.junit.jupiter.api.Assertions.assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM audit_events WHERE action='POST_VOTED' AND actor_user_id=?",Integer.class,voter));
   org.junit.jupiter.api.Assertions.assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM point_transactions WHERE reason='POST_VOTED' AND actor_user_id=?",Integer.class,voter));
   mvc.perform(post("/api/v1/posts/"+postId+"/comments").contentType(MediaType.APPLICATION_JSON).content("{\"userId\":"+voter+",\"content\":\"A timestamped comment\"}"))
       .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated())
       .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.authorName").exists())
       .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.createdAt").exists());
   org.junit.jupiter.api.Assertions.assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM post_comments WHERE post_id=?",Integer.class,postId));
   org.junit.jupiter.api.Assertions.assertEquals(1,jdbc.queryForObject("SELECT COUNT(*) FROM audit_events WHERE action='COMMENT_CREATED' AND actor_user_id=?",Integer.class,voter));
   mvc.perform(get("/api/v1/posts/"+postId+"/comments")).andExpect(status().isOk())
       .andExpect(jsonPath("$[0].authorName").value("Jamor Kamm"))
       .andExpect(jsonPath("$[0].createdAt").exists());
 }
}
