package com.piggymetrics.zipkinapm;

import brave.httpclient.TracingHttpClientBuilder;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.core.type.AnnotationMetadata;

@Configuration
@Import(ZipkinApmAutoConfiguration.BeanPostProcessorsRegistrar.class)
// Lowest precedence order
@Order
public class ZipkinApmAutoConfiguration {
    @Bean
    @ConditionalOnClass(MongoClient.class)
    @ConditionalOnMissingBean(type = "com.mongodb.MongoClientOptions")
    // TODO: find a way to merge multiple bean
    public MongoClientOptions mongoClientOptions() {
        return MongoClientOptions.builder()
                .addCommandListener(MongoZipkinApmConfiguration.getCommandListener())
                .build();
    }

    @Bean
    @ConditionalOnClass(HttpClient.class)
    @ConditionalOnBean(type = "org.apache.http.impl.client.HttpClientBuilder")
    public HttpClientBuilder apacheHttpClientBuilder() {
        return null;
    }

    @ConditionalOnBean(type = "org.apache.http.impl.client.HttpClientBuilder")
    public void configApacheHttpClientBuilder(HttpClientBuilder builder) {

    }

    public static class BeanPostProcessorsRegistrar implements ImportBeanDefinitionRegistrar {
        @Override
        public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        }
    }
}
