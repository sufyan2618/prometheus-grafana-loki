import express from 'express';
import promClient from 'prom-client';
import responseTime from 'response-time';
const app = express();
import { createLogger } from "winston";
import LokiTransport from "winston-loki";
const logger = createLogger({
    transports: [
        new LokiTransport({
            host: "http://127.0.0.1:3100",
        }),
    ],
});

const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics();

const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 750, 1000]
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
});

app.use(responseTime((req, res, time) => {
    httpRequestsTotal.inc();
    httpRequestDurationMicroseconds.labels(req.method, req.path, res.statusCode).observe(time);
}));

app.get('/hello', (req, res) => {
    res.send('Hello World!');
    logger.info("Root endpoint was hit");
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 

