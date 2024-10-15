import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';

export { trace, context, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
export type { Tracer } from '@opentelemetry/api';

export const startTracing = () => {
	const exporter = new OTLPTraceExporter();

	const sdk = new NodeSDK({
		traceExporter: exporter,
		instrumentations: [],
		serviceName: 'core',
	});
	sdk.start();
};

startTracing();
