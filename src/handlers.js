
var prometheus = require("prometheus-wrapper");
const sleep = require('await-sleep')
const axios = require('axios')
const config = require('./lib/config')
const roundRobin = require('./balancing/roundRobin.js')

const pool = config.get('pool')
const roundRobinInstance = new roundRobin(pool)
const MAX_DELAY = config.get('maxRetryDelay')

async function getHandler (req, res) {
    prometheus.get("request_counter").inc({'type': 'get'});
    try {
      var request_time_summary_end = prometheus.get("request_time").startTimer({ type: 'get' });
      upstream = roundRobinInstance.getUpstream()
      upstreamUrl = upstream + req.url
      prometheus.get("upstream_request_counter").inc({'address': upstream});
      const response = await axios.get(upstreamUrl)
      request_time_summary_end()
      res.status(response.status)
      res.send(response.data)
    } catch (error) {
      prometheus.get("error_counter").inc({'type': 'get'});
      res.status(500)
      res.end()
    }
  }
  
async function postHandler(req, res)  {  
    prometheus.get("request_counter").inc({'type': 'post'})
    const postPromises = pool.map(upstream =>
      retryBackoff(async () => {
          prometheus.get("upstream_request_counter").inc({'address': upstream})
          var request_time_summary_end = prometheus.get("request_time").startTimer({ type: 'post' });
          var response = await axios.post(upstream + req.url, req.body, {
              headers: { 'Content-Type': 'application/json' },
            })
          request_time_summary_end()
          return response          
        }
      )
    )
    const response = await Promise.race(postPromises)
    res.status(response.status)
    res.send(response.data)
}

async function retryBackoff(func, delay = 0) {
  delay = delay < MAX_DELAY ? delay : MAX_DELAY
  await sleep(delay)
  try {
    return await func()
  } catch (e) {
    prometheus.get("error_counter").inc({'type': 'post'});
    return retryBackoff(func, delay * 2 || 300)
  }
}
 
module.exports.getHandler = getHandler
module.exports.postHandler = postHandler