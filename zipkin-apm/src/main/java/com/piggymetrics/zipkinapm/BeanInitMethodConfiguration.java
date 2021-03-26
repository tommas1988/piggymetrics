package com.piggymetrics.zipkinapm;

import net.sf.cglib.proxy.*;
import org.springframework.beans.factory.support.RootBeanDefinition;
import net.sf.cglib.core.DefaultNamingPolicy;

import java.lang.reflect.Method;

abstract public class BeanInitMethodConfiguration extends BeanFactoryPostProcessorConfiguration {
    abstract protected RootBeanDefinition getTargetBeanDefinition();

    private static final String DEFAULT_INIT_METHOD_NAME = "enableZipkinApm";

    public interface ZipkinApmInitMethod {
        void enableZipkinApm();
    }

    public static class DefaultMethodInterceptor implements MethodInterceptor {
        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            return null;
        }
    }

    public static class InitMethodProxyMethodInterceptor implements MethodInterceptor {
        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            // invoke original custom init method first
            Object r = proxy.invoke(obj, args);



            return r;
        }
    }

    public static class InitMethodCallbackFilter implements CallbackFilter {
        public static final Class[] callbackTypes = new Class[] {
                NoOp.class,
                DefaultMethodInterceptor.class,
                InitMethodCallbackFilter.class
        };

        private String customInitMethod;

        public InitMethodCallbackFilter(String customInitMethod) {
            this.customInitMethod = customInitMethod;
        }

        @Override
        public int accept(Method method) {
            String methodName = method.getName();
            if (customInitMethod != null && methodName.equals(customInitMethod)) {
                return 2;
            } else if ("enableZipkinApm".equals(methodName)) {
                return 1;
            }
            return 0;
        }
    }

    @Override
    public void config() {
        RootBeanDefinition bd = getTargetBeanDefinition();

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

        String originInitMethodName = bd.getInitMethodName();
        if (originInitMethodName == null) {
            enhancer.setInterfaces(new Class[] { ZipkinApmEnabledInitMethod.class });
            bd.setInitMethodName(DEFAULT_INIT_METHOD_NAME);
        }

        enhancer.setCallbackFilter(new InitMethodCallbackFilter(originInitMethodName));
        enhancer.setCallbackTypes(InitMethodCallbackFilter.callbackTypes);

        bd.setBeanClass(enhancer.createClass());
    }
}
