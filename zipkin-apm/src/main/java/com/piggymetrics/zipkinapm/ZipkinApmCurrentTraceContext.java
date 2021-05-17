package com.piggymetrics.zipkinapm;

import brave.internal.HexCodec;
import brave.propagation.CurrentTraceContext;
import brave.propagation.TraceContext;
import org.slf4j.MDC;

public class ZipkinApmCurrentTraceContext extends CurrentTraceContext {
    private final static String TRACE_ID_NAME = "trace.id";
    private final static String SPAN_ID_NAME = "span.id";
    private final static String SPAN_EXPORTED_NAME = "span-exported";

    CurrentTraceContext delegate;

    public ZipkinApmCurrentTraceContext() {
        delegate = CurrentTraceContext.Default.inheritable();
    }

    @Override
    public TraceContext get() {
        return delegate.get();
    }

    @Override
    public Scope newScope(TraceContext currentSpan) {
        final String previousTraceId = MDC.get(TRACE_ID_NAME);
        final String previousSpanId = MDC.get(SPAN_ID_NAME);
        final String previousExported = MDC.get(SPAN_EXPORTED_NAME);

        if (currentSpan != null) {
            String traceIdString = currentSpan.traceIdString();
            MDC.put(TRACE_ID_NAME, traceIdString);
            String spanId = HexCodec.toLowerHex(currentSpan.spanId());
            MDC.put(SPAN_ID_NAME, spanId);
            String sampled = String.valueOf(currentSpan.sampled());
            MDC.put(SPAN_EXPORTED_NAME, sampled);
        } else {
            MDC.remove(TRACE_ID_NAME);
            MDC.remove(SPAN_ID_NAME);
            MDC.remove(SPAN_EXPORTED_NAME);
        }

        return new CurrentTraceContextScope(
                delegate.newScope(currentSpan), previousTraceId, previousSpanId, previousExported);
    }

    static class CurrentTraceContextScope implements Scope {
        final Scope parent;
        final String previousTraceId;
        final String previousSpanId;
        final String previousExported;

        CurrentTraceContextScope(
                Scope parent, String previousTraceId, String previousSpanId, String previousExported) {
            this.parent = parent;
            this.previousTraceId = previousTraceId;
            this.previousSpanId = previousSpanId;
            this.previousExported = previousExported;
        }

        @Override
        public void close() {
            parent.close();
            if (previousTraceId != null) {
                MDC.put(TRACE_ID_NAME, previousTraceId);
                MDC.put(SPAN_ID_NAME, previousSpanId);
                MDC.put(SPAN_EXPORTED_NAME, previousExported);
            } else {
                MDC.remove(TRACE_ID_NAME);
                MDC.remove(SPAN_ID_NAME);
                MDC.remove(SPAN_EXPORTED_NAME);
            }
        }
    }
}