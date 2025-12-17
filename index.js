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

collectDefaultMetrics