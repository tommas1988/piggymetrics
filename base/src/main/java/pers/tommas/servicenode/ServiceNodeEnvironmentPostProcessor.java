package pers.tommas.servicenode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.util.StringUtils;

import java.util.Map;

public class ServiceNodeEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> sysEnv = environment.getSystemEnvironment();
        if (StringUtils.isEmpty(sysEnv.get("SERVICE_NAME_NAME")))
            return;

        // TODO: is it possible to use framework to inject ServiceNode
        sysEnv.put("SERVICE_NAME_NAME", new HostNameServiceNode().getName(environment));
    }
}
