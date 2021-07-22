package pers.tommas.logging;

import java.util.HashMap;

public class EcsService extends HashMap<String, String> {
    public void setEphemeralId(String ephemeralId) {
        this.put("service.ephemeral_id", ephemeralId);
    }

    public void setId(String id) {
        this.put("service.id", id);
    }

    public void setName(String name) {
        this.put("service.name", name);
    }

    public void setNodeName(String nodeName) {
        this.put("service.node.name", nodeName);
    }

    public void setState(String state) {
        this.put("service.state", state);
    }

    public void setType(String type) {
        this.put("service.type", type);
    }

    public void setVersion(String version) {
        this.put("service.version", version);
    }
}
