import client from 'prom-client';

// Collect default Node.js V8 runtime metrics (Memory, Event Loop, CPU, GC)
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'nexus_' });

export const httpRequestCounter =
  (register.getSingleMetric('nexus_http_requests_total') as client.Counter) ||
  new client.Counter({
    name: 'nexus_http_requests_total',
    help: 'Total HTTP requests processed by Nexus E-Commerce',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
  });

export const httpRequestDuration =
  (register.getSingleMetric('nexus_http_request_duration_seconds') as client.Histogram) ||
  new client.Histogram({
    name: 'nexus_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.02, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  });

export const ordersCounter =
  (register.getSingleMetric('nexus_orders_placed_total') as client.Counter) ||
  new client.Counter({
    name: 'nexus_orders_placed_total',
    help: 'Total successful retail orders placed',
    labelNames: ['payment_method'],
    registers: [register],
  });

export const gmvCounter =
  (register.getSingleMetric('nexus_gmv_inr_total') as client.Counter) ||
  new client.Counter({
    name: 'nexus_gmv_inr_total',
    help: 'Gross Merchandise Value (GMV) in INR',
    registers: [register],
  });

export const tradeInCounter =
  (register.getSingleMetric('nexus_trade_in_valuations_total') as client.Counter) ||
  new client.Counter({
    name: 'nexus_trade_in_valuations_total',
    help: 'Total trade-in buyback valuations computed',
    labelNames: ['device_type'],
    registers: [register],
  });

export { register };

