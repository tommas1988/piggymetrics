package com.piggymetrics.zipkinapm;

import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.autoconfigure.AutoConfigureOrder;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.Ordered;
import org.springframework.core.type.AnnotationMetadata;

@Import(ZipkinApmAutoConfiguration.BeanPostProcessorsRegistrar.class)
@AutoConfigureOrder(Ordered.LOWEST_PRECEDENCE)
public class ZipkinApmAutoConfiguration {
    public static class BeanPostProcessorsRegistrar implements ImportBeanDefinitionRegistrar {
        @Override
        public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        }
    }
}
