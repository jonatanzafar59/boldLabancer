process.on('unhandledRejection', r => console.log(r));

var pino_config = {
    useLevelLabels: true,
    prettyPrint: { 
        colorize: true,
        crlf: true,
        ignore: 'hostname'
    },
    level: 20
}


const logger = require('pino')(pino_config)

// logger.level = 20

module.exports = logger

