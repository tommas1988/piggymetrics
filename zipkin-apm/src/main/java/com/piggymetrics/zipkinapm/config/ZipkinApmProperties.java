package com.piggymetrics.zipkinapm.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import javax.validation.constraints.NotNull;
import java.util.List;

@ConfigurationProperties(value = "zipkin-apm", ignoreUnknownFields = false)
@Validated
public class ZipkinApmProperties {
    enum Sender {
        okHttp,
        rabbitmq,
    }

    private String serviceName = "__unknown_service__";
    private boolean supportsJoin = true;
    private boolean traceId128Bit = true;

    private Sender sender;

    // zipkin server url
    @NotNull
    private String zipkinBaseUrl;

    // TODO: define a Convertor to support com.rabbitmq.client.Address
    @NotNull
    private List<String> rabbitmqAddresses;

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

    public Sender getSender() {
        return sender;
    }

    public void setSender(Sender sender) {
        this.sender = sender;
    }

    public String getZipkinBaseUrl() {
        return zipkinBaseUrl;
    }

    public void setZipkinBaseUrl(String zipkinBaseUrl) {
        this.zipkinBaseUrl = zipkinBaseUrl;
    }

    public List<String> getRabbitmqAddresses() {
        return rabbitmqAddresses;
    }

    public void setRabbitmqAddress(List<String> rabbitmqAddresses) {
        this.rabbitmqAddresses = rabbitmqAddresses;
    }
}
