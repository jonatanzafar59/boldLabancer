const logger = require('./lib/logger')
const childLogger = logger.child({module: 'boldLabancer'})
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const config = require('./lib/config')

async function setupPool() {
  numberOfUpstreams = config.get('numberOfUpstreams')
  basePort = Number(config.get('basePort'))
  hostname = "localhost"
  var pool = []
  for(var index = 0; index < numberOfUpstreams; index += 1) {
    current = 'http://' + hostname + ':' + (basePort + index)
    pool.push(current)
  }
  return pool
}

async function startListener() {
  const app = express();
  app.use(bodyParser.json());
  var server = http.createServer(app);
  server.listen(config.get('port'));
  require('./lib/metrics')(app, server);
  const pool = await setupPool()
  config.set('pool', pool)
  require('./routes')(app)
  // return app;
}

startListener();
childLogger.info("boldLabancer is listening on 'http://localhost:" + config.get('port') + "'");
