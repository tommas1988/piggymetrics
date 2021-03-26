package com.piggymetrics.zipkinapm;

import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

abstract public class BeanFactoryPostProcessorConfiguration implements InstrumentationConfiguration {
    abstract public boolean canConfig();

    private ConfigurableListableBeanFactory beanFactory;

    public ConfigurableListableBeanFactory getBeanFactory() {
        return beanFactory;
    }

    public void setBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }
}
