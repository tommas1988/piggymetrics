package com.piggymetrics.zipkinapm.instrument.mongodb;

import brave.Tracing;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;

import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cloud.sleuth.autoconfig.TraceAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@AutoConfigureAfter(TraceAutoConfiguration.class)
@ConditionalOnClass(MongoClient.class)
public class TraceMongodbAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(type = "com.mongodb.MongoClientOptions")
    public MongoClientOptions mongoClientOptions() {
        return MongoClientOptions.builder()
                .addCommandListener(MongoDBTracing.create(Tracing.current()).commandListener())
                .build();
    }
}
