package com.piggymetrics.zipkinapm.config;

import brave.Tracing;
import brave.propagation.CurrentTraceContext;
import brave.propagation.Propagation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import zipkin2.reporter.Sender;
import zipkin2.reporter.brave.AsyncZipkinSpanHandler;
import zipkin2.reporter.brave.ZipkinSpanHandler;
import zipkin2.reporter.okhttp3.OkHttpSender;

@Configuration
@EnableConfigurationProperties(ZipkinApmProperties.class)
public class TracingAutoConfiguration {
    /** Allows log patterns to use {@code %{traceId}} {@code %{spanId}} and {@code %{userName}} */
    /*@Bean
    CurrentTraceContext.ScopeDecorator correlationScopeDecorator() {
        return MDCScopeDecorator.newBuilder()
                .add(CorrelationScopeConfig.SingleCorrelationField.create(USER_NAME)).build();
    }*/

    /** Propagates trace context between threads. */
    /*@Bean CurrentTraceContext currentTraceContext(CurrentTraceContext.ScopeDecorator correlationScopeDecorator) {
        return ThreadLocalCurrentTraceContext.newBuilder()
                .addScopeDecorator(correlationScopeDecorator)
                .build();
    }*/

    /** Configures propagation for {@link #USER_NAME}, using the remote header "user_name" */
    /*@Bean Propagation.Factory propagationFactory() {
        return BaggagePropagation.newFactoryBuilder(B3Propagation.FACTORY)
                .add(SingleBaggageField.newBuilder(USER_NAME).addKeyName("user_name").build())
                .build();
    }*/

    /** Configuration for how to send spans to Zipkin */
    @Bean
    @ConditionalOnProperty(prefix = "zipkin-apm", name = {"okHttpSender", "zipkinUrl"})
    Sender sender(ZipkinApmProperties zipkinApmConfig) {
        return OkHttpSender.create(zipkinApmConfig.getZipkinUrl());
    }

    /** Configuration for how to buffer spans into messages for Zipkin */
    @Bean AsyncZipkinSpanHandler zipkinSpanHandler(Sender sender) {
        return AsyncZipkinSpanHandler.create(sender);
    }

    @Bean
    Tracing tracing(@Value("${spring.application.name}") String serviceName,
                    ZipkinApmProperties zipkinApmConfig,
                    Propagation.Factory propagationFactory,
                    CurrentTraceContext currentTraceContext,
                    ZipkinSpanHandler zipkinSpanHandler) {
        if (StringUtils.isEmpty(serviceName)) {
            serviceName = zipkinApmConfig.getServiceName();
        }
        return Tracing.newBuilder()
                .localServiceName(serviceName)
                .supportsJoin(zipkinApmConfig.isSupportsJoin())
                .traceId128Bit(zipkinApmConfig.isTraceId128Bit())
                .propagationFactory(propagationFactory)
                .currentTraceContext(currentTraceContext)
                .addSpanHandler(zipkinSpanHandler).build();
    }
}
