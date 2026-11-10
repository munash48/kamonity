package com.kamonity.config;

import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.StringCodec;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.RedisCodec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
public class RateLimitConfig {
    @Bean(destroyMethod = "shutdown")
    RedisClient invitationRateLimitRedisClient(@Value("${spring.data.redis.host:localhost}") String host,@Value("${spring.data.redis.port:6379}") int port){
        return RedisClient.create("redis://"+host+":"+port);
    }
    @Bean(destroyMethod = "close")
    @Lazy
    StatefulRedisConnection<String,byte[]> invitationRateLimitConnection(RedisClient client){
        return client.connect(RedisCodec.of(StringCodec.UTF8,ByteArrayCodec.INSTANCE));
    }
    @Bean
    @Lazy
    ProxyManager<String> invitationRateLimitProxyManager(StatefulRedisConnection<String,byte[]> connection){
        return LettuceBasedProxyManager.builderFor(connection).build();
    }
}
