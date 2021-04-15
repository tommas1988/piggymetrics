package com.piggymetrics.zipkinapm.config;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.piggymetrics.zipkinapm.MongoZipkinApmConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(MongoClient.class)
public class MongoAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(type = "com.mongodb.MongoClientOptions")
    public MongoClientOptions mongoClientOptions() {
        return MongoClientOptions.builder()
                .addCommandListener(MongoZipkinApmConfiguration.getCommandListener())
                .build();
    }
}
