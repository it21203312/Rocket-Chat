import { context, propagation, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Span, SpanOptions, Tracer } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';

export { initDatabaseTracing } from './traceDatabaseCalls';

let tracer: Tracer | undefined;

const otelExporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';

export function isTracingEnabled() {
	return ['yes', 'true'].includes(String(process.env.TRACING_ENABLED).toLowerCase());
}

export const startTracing = ({ service }: { service: string }) => {
	const exporter = new OTLPTraceExporter({ url: otelExporterUrl });

	const sdk = new NodeSDK({
		traceExporter: exporter,
		instrumentations: [],
		serviceName: service,
	});
	sdk.start();

	tracer = trace.getTracer(service);
};

export function tracerSpan<F extends (span?: Span) => ReturnType<F>>(
	name: string,
	options: SpanOptions,
	fn: F,
	optl?: unknown,
): ReturnType<F> {
	if (!isTracingEnabled()) {
		return fn();
	}

	if (!tracer) {
		throw new Error(`Tracing is enabled but not started. You should call 'startTracing()' to fix this.`);
	}

	const computeResult = (span: Span) => {
		try {
			const result = fn(span);
			if (result instanceof Promise) {
				result.catch((err) => {
					span.recordException(err);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: err.message,
					});
				});

				return result;
			}
			return result;
		} catch (err: any) {
			span.recordException(err);
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: err.message,
			});
			throw err;
		} finally {
			span.end();
		}
	};

	if (optl) {
		const activeContext = propagation.extract(context.active(), optl);

		return tracer.startActiveSpan(name, options, activeContext, computeResult);
	}

	return tracer.startActiveSpan(name, options, computeResult);
}

export function tracerActiveSpan<F extends (span?: Span) => ReturnType<F>>(
	name: string,
	options: SpanOptions,
	fn: F,
	optl?: unknown,
): ReturnType<F> {
	const currentSpan = trace.getSpan(context.active());

	if (process.env.LOG_UNTRACED_METHODS) {
		console.log(`No active span for ${name}`, new Error().stack);
	}

	return currentSpan ? tracerSpan(name, options, fn, optl) : fn();
}

export function injectCurrentContext() {
	const output: Record<string, string> = {};
	propagation.inject(context.active(), output);
	return output;
}
