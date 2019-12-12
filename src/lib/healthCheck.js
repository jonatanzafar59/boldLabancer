function healthCheck () {
    return Promise.resolve()
    // return connectionPool == util.numberOfWorkers() ? Promise.resolve() : Promise.reject(new Error('not connected to all workers')) 
}

module.exports = healthCheck