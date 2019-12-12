const Conf = require('conf');
const config = new Conf();
values = require('./env/defaults')
config.set(values); 

module.exports = config