package com.piggymetrics.zipkinapm.autoconfig;

import brave.propagation.CurrentTraceContext;
import com.piggymetrics.zipkinapm.ZipkinApmCurrentTraceContext;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.cloud.sleuth.autoconfig.TraceAutoConfiguration;
import org.springframework.context.annotation.Bean;

@AutoConfigureBefore(TraceAutoConfiguration.class)
public class ZipkinApmAutoConfiguration {
    @Bean
    public CurrentTraceContext escCurrentTraceContext() {
        return new ZipkinApmCurrentTraceContext();
    }
}
