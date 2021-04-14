package com.piggymetrics.zipkinapm.autoconfig;

import brave.Tracing;
import brave.baggage.CorrelationScopeConfig;
import brave.propagation.CurrentTraceContext;
import brave.propagation.Propagation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import zipkin2.reporter.Sender;
import zipkin2.reporter.brave.AsyncZipkinSpanHandler;
import zipkin2.reporter.brave.ZipkinSpanHandler;

// TODO: use a @EnableConfigurationProperties to get values
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
    Sender sender(
            @Value("${zipkin.baseUrl:http://127.0.0.1:9411}/api/v2/spans") String zipkinEndpoint) {
        return OkHttpSender.create(zipkinEndpoint);
    }

    /** Configuration for how to buffer spans into messages for Zipkin */
    @Bean AsyncZipkinSpanHandler zipkinSpanHandler(Sender sender) {
        return AsyncZipkinSpanHandler.create(sender);
    }

    @Bean
    Tracing tracing(@Value("${brave.localServiceName:${spring.application.name}}") String serviceName,
                    @Value("${brave.supportsJoin:true}") boolean supportsJoin,
                    @Value("${brave.traceId128Bit:false}") boolean traceId128Bit,
                    Propagation.Factory propagationFactory,
                    CurrentTraceContext currentTraceContext,
                    ZipkinSpanHandler zipkinSpanHandler) {
        return Tracing.newBuilder()
                .localServiceName(serviceName)
                .supportsJoin(supportsJoin)
                .traceId128Bit(traceId128Bit)
                .propagationFactory(propagationFactory)
                .currentTraceContext(currentTraceContext)
                .addSpanHandler(zipkinSpanHandler).build();
    }
}
