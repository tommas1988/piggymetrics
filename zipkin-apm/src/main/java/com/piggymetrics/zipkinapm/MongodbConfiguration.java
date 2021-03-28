package com.piggymetrics.zipkinapm;

import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;

public class MongodbConfiguration extends BeanInitMethodConfiguration {
    @Override
    protected RootBeanDefinition getTargetBeanDefinition(ConfigurableListableBeanFactory beanFactory) {
        return null;
    }

    @Override
    protected Class getZipkinApmInitMethodCallback() {
        MethodInterceptor {
            @Override
            public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
                return null;
            }
        }
    }
}
