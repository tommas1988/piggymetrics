package com.piggymetrics.zipkinapm;

import net.sf.cglib.proxy.*;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import net.sf.cglib.core.DefaultNamingPolicy;

import java.lang.reflect.Method;

// TODO: rename
abstract public class BeanInitMethodConfiguration extends BeanFactoryPostProcessorConfiguration {
    abstract protected RootBeanDefinition getTargetBeanDefinition(ConfigurableListableBeanFactory beanFactory);
    // TODO: rename
    abstract protected Class getZipkinApmInitMethodCallback();

    private static final String DEFAULT_INIT_METHOD_NAME = "enableZipkinApm";

    public interface ZipkinApmInitMethod {
        void enableZipkinApm();
    }

    // TODO: need more to outside?
    abstract public static class ZipkinApmInitMethodInterceptor implements MethodInterceptor {
        abstract void interceptZipkinApm(Object o);

        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            Object r = null;
            // invoke own init method first
            if (!(obj instanceof ZipkinApmInitMethod)) {
                r = proxy.invoke(obj, args);
            }

            interceptZipkinApm(obj);

            return r;
        }
    }

    public static class InitMethodCallbackFilter implements CallbackFilter {
        private Class[] callbackTypes;
        private String targetMethodName;

        public InitMethodCallbackFilter(String targetMethodName, Class callbackType) {
            this.targetMethodName = targetMethodName;
            callbackTypes = new Class[] {
                    NoOp.class,
                    callbackType,
            };
        }

        @Override
        public int accept(Method method) {
            String methodName = method.getName();
            if (methodName.equals(targetMethodName)) {
                return 1;
            }

            return 0;
        }

        public Class[] getCallbackTypes() {
            return callbackTypes;
        }
    }

    @Override
    public void config() {
        RootBeanDefinition bd = getTargetBeanDefinition(getBeanFactory());

        Enhancer enhancer = new Enhancer();
        enhancer.setNamingPolicy(new DefaultNamingPolicy() {
            @Override
            protected String getTag() {
                return "ByZipkinApm";
            }
        });
        enhancer.setUseFactory(false);
        enhancer.setSuperclass(bd.getBeanClass());
        // enhancer.setStrategy();

        InitMethodCallbackFilter callbackFilter;
        String originInitMethodName = bd.getInitMethodName();
        if (originInitMethodName == null) {
            enhancer.setInterfaces(new Class[] { ZipkinApmEnabledInitMethod.class });
            bd.setInitMethodName(DEFAULT_INIT_METHOD_NAME);
            callbackFilter = new InitMethodCallbackFilter(DEFAULT_INIT_METHOD_NAME, getZipkinApmInitMethodCallback());
        } else {
            callbackFilter = new InitMethodCallbackFilter(originInitMethodName, getZipkinApmInitMethodCallback());
        }

        enhancer.setCallbackFilter(callbackFilter);
        enhancer.setCallbackTypes(callbackFilter.getCallbackTypes());

        bd.setBeanClass(enhancer.createClass());
    }
}
