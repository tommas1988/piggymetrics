package com.piggymetrics.zipkinapm;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.core.Ordered;

public class ZipkinApmBeanFactoryPostProcessor implements BeanFactoryPostProcessor, Ordered {
    private BeanFactoryPostProcessorConfiguration[] candidates;

    public ZipkinApmBeanFactoryPostProcessor() {
        candidates = new BeanFactoryPostProcessorConfiguration[] {
                new MongodbConfiguration(),
        };
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        for (BeanFactoryPostProcessorConfiguration configuration : candidates) {
            if (configuration.canConfig())
                configuration.config();
        }
    }
}
