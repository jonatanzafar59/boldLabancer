var { getHandler, postHandler } = require('./handlers')

function initRoutes(app) {
    app.post('/register', postHandler)
    app.post('/changePassword', postHandler)
    app.get('/login', getHandler) 
}

module.exports = initRoutes