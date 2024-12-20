import * as vscode from 'vscode';
import * as appInsights from 'applicationinsights';

//-----------------------------------------------------------------------------
const tag_mapping: Record<string, string> = {
    'common.extname': 'ai.application.name',
    'common.extversion': 'ai.application.ver',
    'common.vscodemachineid': 'ai.device.id',
    'common.vscodesessionid': 'ai.session.id',
    'common.vscodeversion': 'vscode.version',
    'common.product': 'ai.device.type',
};

export class ApplicationInsightsTelemetrySender implements vscode.TelemetrySender {
    private client: appInsights.TelemetryClient;

    constructor(connectionString: string) {
        appInsights.setup(connectionString).start();
        this.client = appInsights.defaultClient;
        console.log('Application Insights initialized.');
    }

    private getTags(data: Record<string, any>) {
        const tags: Record<string, unknown> = {
            'ai.device.os': process.platform,
        };
        for (const [key, value] of Object.entries(data)) {
            const tagkey = tag_mapping[key] ?? (key.startsWith('common.') && key.replace('common.', 'vscode.'));
            if (tagkey) {
                tags[tagkey] = value;
                delete data[key];
            }
        }
        return tags;
    }

    private isEmpty(obj: Record<string, any>): boolean {
        return Object.keys(obj).length === 0;
    }

    sendEventData(eventName: string, data: Record<string, any>): void {
        const tags = this.getTags(data);
        const properties: Record<string, string> = {};
        const measurements: Record<string, number> = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'number') {
                measurements[key] = value;
            } else {
                properties[key] = String(value);
            }
        }

        console.log(`Sending event data: ${eventName}`);
        this.client.trackEvent({ name: eventName, properties, measurements });
    }

    sendErrorData(error: Error, data: Record<string, any>): void {
        const tags = this.getTags(data);
        const properties: Record<string, string> = {};

        for (const [key, value] of Object.entries(data)) {
            properties[key] = String(value);
        }

        console.log(`Sending error data: ${error.message}`);
        this.client.trackException({ exception: error, properties });
    }
}

let reporter: vscode.TelemetryLogger;

export function init(connectionString: string) {
    reporter = vscode.env.createTelemetryLogger(new ApplicationInsightsTelemetrySender(connectionString));
    reporter.logUsage('extension.activate');
    return reporter;
}

export function send(eventName: string, data?: Record<string, any>): void {
    const telemetryEnabled = vscode.workspace.getConfiguration().get<boolean>('telemetry.enableTelemetry', true);
    if (!telemetryEnabled) {
        console.log('Telemetry is disabled.');
        return;
    }

    console.log(`Logging usage: ${eventName}`);
    reporter.logUsage(eventName, data);
}