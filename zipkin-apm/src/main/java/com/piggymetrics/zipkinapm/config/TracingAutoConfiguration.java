package com.piggymetrics.zipkinapm.config;

import brave.Tracing;
import brave.http.HttpTracing;
import brave.propagation.B3Propagation;
import brave.propagation.CurrentTraceContext;
import brave.propagation.Propagation;
import brave.propagation.ThreadLocalCurrentTraceContext;
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
import zipkin2.reporter.amqp.RabbitMQSender;

@Configuration
@EnableConfigurationProperties(ZipkinApmProperties.class)
public class TracingAutoConfiguration {
    /** Allows log patterns to use {@code %{traceId}} {@code %{spanId}} and {@code %{userName}} */
    /*@Bean
    CurrentTraceContext.ScopeDecorator correlationScopeDecorator() {
        return MDCScopeDecorator.newBuilder()
                .add(CorrelationScopeConfig.SingleCorrelationField.create(USER_NAME)).build();
    }*/

    @Bean
    CurrentTraceContext currentTraceContext(/*CurrentTraceContext.ScopeDecorator correlationScopeDecorator*/) {
        CurrentTraceContext.Builder builder = ThreadLocalCurrentTraceContext.newBuilder();
        /*if (correlationScopeDecorator != null) {
            builder.addScopeDecorator(correlationScopeDecorator);
        }*/
        return builder.build();
    }

    @Bean
    Propagation.Factory propagationFactory() {
        /*return BaggagePropagation.newFactoryBuilder(B3Propagation.FACTORY)
                .add(SingleBaggageField.newBuilder(USER_NAME).addKeyName("user_name").build())
                .build();*/
        return B3Propagation.FACTORY;
    }

    /** Configuration for how to send spans to Zipkin */
    @Bean
    @ConditionalOnProperty(prefix = "zipkin-apm", name = {"sender"}, havingValue = "okHttp")
    Sender okHttpSender(ZipkinApmProperties zipkinApmConfig) {
        return OkHttpSender.create(zipkinApmConfig.getZipkinBaseUrl());
    }

    @Bean
    @ConditionalOnProperty(prefix = "zipkin-apm", name = {"sender"}, havingValue = "rabbitmq")
    Sender rabbitmqSender(ZipkinApmProperties zipkinApmConfig) {
        StringBuilder addresses = null;
        for (String address : zipkinApmConfig.getRabbitmqAddresses()) {
            if (addresses != null) {
                addresses.append(',');
            } else {
                addresses = new StringBuilder(16);
            }
            addresses.append(address);
        }
        return RabbitMQSender.newBuilder()
                .addresses(addresses.toString())
                .build();
    }


    /** Configuration for how to buffer spans into messages for Zipkin */
    @Bean
    AsyncZipkinSpanHandler zipkinSpanHandler(Sender sender) {
        return AsyncZipkinSpanHandler.create(sender);
    }

    @Bean
    Tracing braveTracing(@Value("${spring.application.name}") String serviceName,
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

    /** Decides how to name and tag spans. By default they are named the same as the http method. */
    @Bean
    HttpTracing httpTracing(Tracing tracing) {
        return HttpTracing.create(tracing);
    }
}
