import * as vscode from 'vscode';
import * as https from 'https';

//-----------------------------------------------------------------------------
//	Telemetry
//-----------------------------------------------------------------------------

const tag_mapping: Record<string, string> = {
    'common.extname': 'ai.application.name',
    'common.extversion': 'ai.application.ver',
    'common.vscodemachineid': 'ai.device.id',
    'common.vscodesessionid': 'ai.session.id',
    'common.vscodeversion': 'vscode.version',
    'common.product': 'ai.device.type',
};

class ApplicationInsightsTelemetrySender implements vscode.TelemetrySender {
    private iKey: string;
    private appId: string;
    private hostname: string;

    constructor(connectionString: string) {
        const parts = Object.fromEntries(connectionString.split(';').map(i => i.split('=')));
        this.iKey = parts.InstrumentationKey;
        this.appId = parts.ApplicationId;
        this.hostname = vscode.Uri.parse(parts.IngestionEndpoint).authority;
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

        const measurements: Record<string, number> = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'number') {
                measurements[key] = value;
                delete data[key];
            }
        }

        this.sendTelemetry('Event', tags, {
            ver: 2,
            name: eventName,
            ...(!this.isEmpty(data) && { properties: data }),
            ...(!this.isEmpty(measurements) && { measurements }),
        });
    }

    sendErrorData(error: Error, data: Record<string, any>): void {
        const tags = this.getTags(data);
        this.sendTelemetry('Exception', tags, {
            exceptions: [
                {
                    typeName: error.name,
                    message: error.message,
                    hasFullStack: true,
                    stack: error.stack
                }
            ],
            severityLevel: 3, // Error
            properties: data
        });
    }

    private sendTelemetry(type: 'Event' | 'Exception', tags: Record<string, any>, baseData: Record<string, any>): void {
        const body0 = {
            name: `Microsoft.ApplicationInsights.${type}`,
            time: new Date().toISOString(),
            iKey: this.iKey,
            appId: this.appId,
            tags,
            data: {
                baseType: `${type}Data`,
                baseData
            }
        };
        const body = JSON.stringify(body0);

        const options = {
            hostname: this.hostname,
            port: 443,
            path: '/v2/track',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, res => {
            console.log('Status Code:', res.statusCode);
            res.on('data', chunk => console.log('Response body:', chunk.toString()));
        });

        req.on('error', error => console.error('Error:', error));
        req.write(body);
        req.end();
    }
}

let reporter: vscode.TelemetryLogger;

export function init(connectionString: string) {
    reporter = vscode.env.createTelemetryLogger(new ApplicationInsightsTelemetrySender(connectionString));
    reporter.logUsage('extension.activate');
    return reporter;
}

export function send(eventName: string, data?: Record<string, any>): void {
    reporter.logUsage(eventName, data);
}