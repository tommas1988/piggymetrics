package com.piggymetrics.zipkinapm;

import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

// TODO: rename
abstract public class BeanFactoryPostProcessorConfiguration implements InstrumentationConfiguration {
    private ConfigurableListableBeanFactory beanFactory;

    public ConfigurableListableBeanFactory getBeanFactory() {
        return beanFactory;
    }

    public void setBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }
}
