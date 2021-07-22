package pers.tommas.servicenode;

import org.springframework.core.env.ConfigurableEnvironment;

public interface ServiceNode {
    String getName(ConfigurableEnvironment environment);
}
