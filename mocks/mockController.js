const mockServer = require('./mockServer')
const config = require('../src/lib/config')
var numberOfMocks = Number(config.get('numberOfUpstreams'))
var mockServers = []
function shutDown() {
    setTimeout(() => process.exit(0));
  }
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

for (var index = 0; index < numberOfMocks; index += 1) {
    instance = new mockServer(index)
    instance.start()
    mockServers.push(instance)
}

async function killFastestUpstream(req, res) {
  for (var index in mockServers) {
    current = mockServers[index]
    if (current.isRunning) {
      current.stop()
      res.send({ status: 'OK', id: current._port })
      break
    }
  }
}

const express = require('express')
const app = express()
app.get('/killFastestUpstream', killFastestUpstream)
var port = 5000
app.listen(port, () => console.log(`mockController listening on port ${port}`))
