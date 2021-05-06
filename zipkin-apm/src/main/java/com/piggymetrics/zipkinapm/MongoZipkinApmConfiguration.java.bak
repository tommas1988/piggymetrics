package com.piggymetrics.zipkinapm;

import brave.Tracing;
import brave.mongodb.MongoDBTracing;
import com.mongodb.event.CommandListener;

public class MongoZipkinApmConfiguration {
    public static CommandListener getCommandListener() {
        return MongoDBTracing.create(Tracing.current())
                .commandListener();
    }
}
