
var prometheus = require("prometheus-wrapper");

prometheus.createSummary("request_time", "boldLabancer request time", {
    percentiles: [ 0.5, 0.9, 0.99 ],  
    maxAgeSeconds: 15,  
    ageBuckets: 4
  },['type']);
  prometheus.createCounter("error_counter", "number of errors", ['type']);
  prometheus.createCounter("request_counter", "boldLabancer's number of requests", ['type']);
  prometheus.createCounter("upstream_request_counter", "request counter for each upstream, testing that round robin is working", ['address']);
  // prometheus.createCounter("pendig_updates_counter", "counter of pending updates in case of POST", []);

