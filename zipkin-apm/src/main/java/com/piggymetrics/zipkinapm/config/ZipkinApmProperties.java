package com.piggymetrics.zipkinapm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import javax.validation.constraints.NotNull;

@ConfigurationProperties("zipkin-apm")
@Validated
public class ZipkinApmProperties {
    private String serviceName = "__unknown_service__";
    private boolean supportsJoin = true;
    private boolean traceId128Bit = true;

    // zipkin server url
    @NotNull
    private String zipkinUrl;

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public boolean isSupportsJoin() {
        return supportsJoin;
    }

    public void setSupportsJoin(boolean supportsJoin) {
        this.supportsJoin = supportsJoin;
    }

    public boolean isTraceId128Bit() {
        return traceId128Bit;
    }

    public void setTraceId128Bit(boolean traceId128Bit) {
        this.traceId128Bit = traceId128Bit;
    }

    public String getZipkinUrl() {
        return zipkinUrl;
    }

    public void setZipkinUrl(String zipkinUrl) {
        this.zipkinUrl = zipkinUrl;
    }
}
