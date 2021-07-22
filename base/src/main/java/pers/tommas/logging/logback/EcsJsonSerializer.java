package pers.tommas.logging.logback;

import pers.tommas.logging.EcsService;

public class EcsJsonSerializer extends co.elastic.logging.EcsJsonSerializer {
    public static void serializeService(StringBuilder builder, EcsService service) {
        for (String key : service.keySet()) {
            builder.append("\"").append(service.get(key)).append("\",");
        }
    }
}
