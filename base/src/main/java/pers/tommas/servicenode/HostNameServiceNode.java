package pers.tommas.servicenode;

import org.springframework.core.env.ConfigurableEnvironment;

import java.net.InetAddress;
import java.net.UnknownHostException;

public class HostNameServiceNode implements ServiceNode {
    private String name;

    @Override
    public String getName(ConfigurableEnvironment environment) {
        String serviceName = environment.getProperty("spring.application.name", String.class);
        String hostName;
        try {
            hostName = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            hostName = "";
        }

        return serviceName + "-" + hostName;
    }
}
