package com.piggymetrics.zipkinapm.config;

import brave.Tracing;
import brave.mongodb.MongoDBTracing;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

@Configuration
@ConditionalOnClass(MongoClient.class)
public class MongoAutoConfiguration {
    @Bean
    @DependsOn({ "braveTracing" })
    @ConditionalOnMissingBean(type = "com.mongodb.MongoClientOptions")
    public MongoClientOptions mongoClientOptions() {
        return MongoClientOptions.builder()
                .addCommandListener(MongoDBTracing.create(Tracing.current())
                        .commandListener())
                .build();
    }
}
