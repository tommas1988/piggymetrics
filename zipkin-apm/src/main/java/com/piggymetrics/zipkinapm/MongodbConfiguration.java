package com.piggymetrics.zipkinapm;

import org.springframework.beans.factory.support.RootBeanDefinition;

public class MongodbConfiguration extends BeanInitMethodConfiguration {
    @Override
    protected RootBeanDefinition getTargetBeanDefinition() {
        return null;
    }

    @Override
    public boolean canConfig() {
        return false;
    }
}
