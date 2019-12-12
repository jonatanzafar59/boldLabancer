const express = require('express')
const bodyParser = require('body-parser')
const sleep = require('await-sleep')
const http = require('http')


class mockServer {
	constructor(index) {
        this.baseDelay = 50
        this.basePort = 3000
        this._port = this.basePort + index
        this._delay = this.baseDelay + (index * 10)
        this._app = express()
        this._app.use(bodyParser.json())
        this._httpServer = http.createServer(this._app);
        this.isRunning = true
    }   
    
    start() {
        this._app.get('/login', this.getHandler.bind(this))
        this._app.post('/changePassword', this.postHandler.bind(this))
        this._app.post('/register', this.postHandler.bind(this))
        this._httpServer.listen(this._port);
        console.log(`mockServer listening on port ${this._port}`)
    }

    stop() {
        this._httpServer.close(() => {});
        this.isRunning = false
        // this._app.close();
    }

    async getHandler(req, res) {
        await sleep(this._delay)
        res.status(201)
        res.send({ id: this._port })
    }
    
    async postHandler(req, res) {
        await sleep(this._delay)
        res.status(201)
        res.send({ id: this._port })
    }
}


module.exports = mockServer