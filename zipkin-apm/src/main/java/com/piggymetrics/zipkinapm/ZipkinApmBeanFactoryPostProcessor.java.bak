package com.piggymetrics.zipkinapm;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.core.Ordered;

public class ZipkinApmBeanFactoryPostProcessor implements BeanFactoryPostProcessor, Ordered {
    private BeanFactoryPostProcessorConfiguration[] candidates;

    public ZipkinApmBeanFactoryPostProcessor() {
        candidates = new BeanFactoryPostProcessorConfiguration[] {
        };
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
    }
}
