package com.piggymetrics.zipkinapm.config;

import brave.http.HttpTracing;
import brave.httpclient.TracingHttpClientBuilder;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(HttpClient.class)
public class HttpClientAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(type = "org.apache.http.impl.client.HttpClientBuilder")
    HttpClientBuilder httpClientBuilder(HttpTracing httpTracing) {
        return TracingHttpClientBuilder.create(httpTracing);
    }
}
