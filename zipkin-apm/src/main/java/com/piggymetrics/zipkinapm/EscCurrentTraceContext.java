package com.piggymetrics.zipkinapm;

import brave.propagation.CurrentTraceContext;
import brave.propagation.TraceContext;

public class EscCurrentTraceContext extends CurrentTraceContext {
    CurrentTraceContext delegate;

    public EscCurrentTraceContext() {
        delegate = CurrentTraceContext.Default.inheritable();
    }

    @Override
    public TraceContext get() {
        return delegate.get();
    }

    @Override
    public Scope newScope(TraceContext currentSpan) {
        final String previousTraceId = MDC.get("traceId");
        final String previousParentId = MDC.get("parentId");
        final String previousSpanId = MDC.get("spanId");
        final String spanExportable = MDC.get("spanExportable");
        final String legacyPreviousTraceId = MDC.get(LEGACY_TRACE_ID_NAME);
        final String legacyPreviousParentId = MDC.get(LEGACY_PARENT_ID_NAME);
        final String legacyPreviousSpanId = MDC.get(LEGACY_SPAN_ID_NAME);
        final String legacySpanExportable = MDC.get(LEGACY_EXPORTABLE_NAME);

        if (currentSpan != null) {
            String traceIdString = currentSpan.traceIdString();
            MDC.put("traceId", traceIdString);
            MDC.put(LEGACY_TRACE_ID_NAME, traceIdString);
            String parentId = currentSpan.parentId() != null ?
                    HexCodec.toLowerHex(currentSpan.parentId()) :
                    null;
            replace("parentId", parentId);
            replace(LEGACY_PARENT_ID_NAME, parentId);
            String spanId = HexCodec.toLowerHex(currentSpan.spanId());
            MDC.put("spanId", spanId);
            MDC.put(LEGACY_SPAN_ID_NAME, spanId);
            String sampled = String.valueOf(currentSpan.sampled());
            MDC.put("spanExportable", sampled);
            MDC.put(LEGACY_EXPORTABLE_NAME, sampled);
            log("Starting scope for span: {}", currentSpan);
            if (currentSpan.parentId() != null) {
                if (log.isTraceEnabled()) {
                    log.trace("With parent: {}", currentSpan.parentId());
                }
            }
        }
        else {
            MDC.remove("traceId");
            MDC.remove("parentId");
            MDC.remove("spanId");
            MDC.remove("spanExportable");
            MDC.remove(LEGACY_TRACE_ID_NAME);
            MDC.remove(LEGACY_PARENT_ID_NAME);
            MDC.remove(LEGACY_SPAN_ID_NAME);
            MDC.remove(LEGACY_EXPORTABLE_NAME);
        }
    }

    static class CurrentTraceContextScope implements Scope {
        Scope parent;
        CurrentTraceContextScope(Scope parent) {
            this.parent = parent;
        }

        @Override
        public void close() {
            parent.close();
        }
    }
}
