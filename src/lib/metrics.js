const logger = require('./logger')
const childLogger = logger.child({module: 'prometheusClient'})
var prometheus = require("prometheus-wrapper");
prometheus.setNamespace(process.env.LABANCER_METRICS_NAMESPACE || "boldlabancer");
const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
var serviceHealthCheck = require('./healthCheck')
var config = require('./config')

async function init(app, server) {
  // var {server, app} = await startMetricsServer();
  require('./exporter.js');
  setMetricsEndpoint(app);
  createHealthServer(server);
}


async function health() {
  var healthChecks = [serviceHealthCheck()]
  const errors = []
  return Promise.all(healthChecks.map(p => p.catch((error) => {
    errors.push(error.toString())
    return undefined
  }))).then(() => {
    if (errors.length) {
      
      throw new HealthCheckError('healtcheck failed', errors)
    }
  })
}

function createHealthServer(server) {
  createTerminus(server, {
    healthChecks: {
      '/health': health,
      verbatim: true
    }
  });

  function shutDown() {
    server.close(() => {});
    setTimeout(() => process.exit(0), 300);
  }
  process.on('SIGTERM', shutDown);
  process.on('SIGINT', shutDown);
  childLogger.info("healthCheck listeing on 'http://localhost:" + config.get('port') + "/health'");

}

async function setMetricsEndpoint(app) {
  app.get('/metrics', function (req, res) {
    res.end(prometheus.getMetrics());
  });
  app.get('/version', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.send({
      version: '1.0.0'
    });
  })
  childLogger.info("metrics listeing on 'http://localhost:" + config.get('port') + "/metrics'");
}

module.exports = init
