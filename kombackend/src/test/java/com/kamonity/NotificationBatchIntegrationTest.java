package com.kamonity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kamonity.model.Notification;
import com.kamonity.repository.NotificationRepository;
import com.kamonity.repository.PostRepository;
import com.kamonity.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes=KomBackendApplication.class)
@AutoConfigureMockMvc
@TestPropertySource(properties={"spring.datasource.url=jdbc:h2:mem:noti-test;MODE=MySQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.jpa.hibernate.ddl-auto=create-drop","spring.flyway.enabled=false"})
class NotificationBatchIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired UserRepository users; @Autowired PostRepository posts; @Autowired NotificationRepository notifications;
 @Test void openingBatchMarksOnlyFiveAndUnreadCountDropsByFive() throws Exception {
  var user=users.findAll().get(0); var post=posts.findAll().get(0);
  for(int i=0;i<7;i++)notifications.save(new Notification(user,post,"VOTE",1,"vote "+i));
  String first=mvc.perform(get("/api/v1/users/"+user.getId()+"/notifications")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  JsonNode batch=json.readTree(first);assertEquals(5,batch.get("items").size());assertEquals(7,batch.get("unreadCount").asInt());
  List<Long> ids=new ArrayList<>();batch.get("items").forEach(n->ids.add(n.get("id").asLong()));
  String viewed=mvc.perform(post("/api/v1/users/"+user.getId()+"/notifications/mark-viewed").contentType("application/json").content(json.writeValueAsString(java.util.Map.of("ids",ids))))
    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  JsonNode after=json.readTree(viewed);assertEquals(2,after.get("unreadCount").asInt());assertEquals(2,after.get("items").size());
 }
}
