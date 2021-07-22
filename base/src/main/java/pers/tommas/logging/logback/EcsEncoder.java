package pers.tommas.logging.logback;

import ch.qos.logback.classic.spi.ILoggingEvent;
import org.springframework.util.StringUtils;
import pers.tommas.logging.EcsService;

/**
 * TODO: Write a better ecs logback encoder, with better extension points
 */
public class EcsEncoder extends co.elastic.logging.logback.EcsEncoder {
    private static final EcsService service = new EcsService();

    @Override
    public byte[] encode(ILoggingEvent event) {
        event.getMDCPropertyMap().putAll(service);
        return super.encode(event);
    }

    public void setServiceEphemeralId(String serviceEphemeralId) {
        if (StringUtils.hasText(serviceEphemeralId))
            service.setEphemeralId(serviceEphemeralId);
    }

    public void setServiceId(String serviceId) {
        if (StringUtils.hasText(serviceId))
            service.setId(serviceId);
    }

    public void setServiceName(String serviceName) {
        if (StringUtils.hasText(serviceName))
            service.setName(serviceName);
    }

    public void setServiceNodeName(String serviceNodeName) {
        if (StringUtils.hasText(serviceNodeName))
            service.setNodeName(serviceNodeName);
    }

    public void setServiceState(String serviceState) {
        if (StringUtils.hasText(serviceState))
            service.setState(serviceState);
    }

    public void setServiceType(String serviceType) {
        if (StringUtils.hasText(serviceType))
            service.setType(serviceType);
    }

    public void setServiceVersion(String serviceVersion) {
        if (StringUtils.hasText(serviceVersion))
            service.setVersion(serviceVersion);
    }
}
