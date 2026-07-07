package com.leaf.algoqueue.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.session.config.SessionRepositoryCustomizer;
import org.springframework.session.data.redis.RedisSessionRepository;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${server.servlet.session.timeout:24h}")
    private Duration sessionTimeout;

    @Bean
    public SessionRepositoryCustomizer<RedisSessionRepository> sessionRepositoryCustomizer() {
        return repository -> repository.setDefaultMaxInactiveInterval(sessionTimeout);
    }

    @Bean
    RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory
    ) {
        RedisTemplate<String, Object> template =
                new RedisTemplate<>();

        template.setConnectionFactory(connectionFactory);

        return template;
    }
}