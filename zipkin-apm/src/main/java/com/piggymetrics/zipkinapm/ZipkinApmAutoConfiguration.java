package com.piggymetrics.zipkinapm;

import com.mongodb.MongoClientOptions;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.*;
import org.springframework.core.Ordered;
import org.springframework.core.type.AnnotationMetadata;

@Configuration
@Import(ZipkinApmAutoConfiguration.BeanPostProcessorsRegistrar.class)
@AutoConfigureOrder(Ordered.LOWEST_PRECEDENCE)
public class ZipkinApmAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(type = "com.mongodb.MongoClientOptions")
    public MongoClientOptions mongoClientOptions() {
        return MongoClientOptions.builder()
                .addCommandListener(MongoZipkinApmConfiguration.getCommandListener())
                .build();
    }

    public static class BeanPostProcessorsRegistrar implements ImportBeanDefinitionRegistrar {
        @Override
        public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        }
    }
}
