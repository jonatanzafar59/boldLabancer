# boldLabancer

'boldLabancer' is a NodeJS based simple load balancer, handling 3 different endpoints:  
`GET - /login`  
`POST - /changePassword`  
`POST - /register`

### Implementation
Every GET request handled is balanced using roundRobin.
Every POST requrst is forwarded to all upstreams available, and send to the client the fastest upstream's response using `Promise.race`. 

### Possible features/Addons
* CommitLog instead of retry forever.
* Hot reload of upstreams
* Tests
* Better logging and handeling exceptions
* Native docker support

## Installing
Copy this repo
```
git clone https://github.com/jonatanzafar59/boldLabancer.git
cd boldLabancer/
npm install
```

## CMD
```
npm start
```
boldLabancer will listen on port 8080
```
$ npm start
[1576148437863] INFO  (36841): metrics listeing on 'http://localhost:8080/metrics'
    module: "prometheusClient"
[1576148437865] INFO  (36841): healthCheck listeing on 'http://localhost:8080/health'
    module: "prometheusClient"
[1576148437866] INFO  (36841): boldLabancer is listening on 'http://localhost:8080'
    module: "boldLabancer"

```

## Testing
## Mocking upstream servers
In order to check differernt scenarios, we need to start ./src/mockController.js using the following command:
```
npm run start:mocks
```
now we have upstream servers running (default is 9), and the controller running on port 5000.
```
mockServer listening on port 3000
mockServer listening on port 3001
mockServer listening on port 3002
mockServer listening on port 3003
mockServer listening on port 3004
mockServer listening on port 3005
mockServer listening on port 3006
mockServer listening on port 3007
mockServer listening on port 3008
mockController listening on port 5000
```
every incremented upstream has a higher delay, in order to test the POST `Promise.race` later (3000 fastest, 3008 slowest).

### Testing GET 
the upstream getting the request returns its ID.
```
curl http://localhost:8080/login
```
test (round robin)
```
$ curl -s http://localhost:8080/login | jq .
{
  "id": 3000
}
$ curl -s http://localhost:8080/login | jq .
{
  "id": 3001
}
$ curl -s http://localhost:8080/login | jq .
{
  "id": 3002
}
$ curl -s http://localhost:8080/login | jq .
{
  "id": 3003
}
```

### Testing POST
The fastest upstream getting the request returns its ID.
```
curl -s -X POST http://localhost:8080/changePassword | jq .
```

test (fastest)
```
$ curl -s -X POST http://localhost:8080/changePassword | jq .
{
  "id": 3000
}
$ curl -s -X POST http://localhost:8080/changePassword | jq .
{
  "id": 3000
}
$ curl -s -X POST http://localhost:8080/changePassword | jq .
{
  "id": 3000
}
```

now, we need to kill the fastest upstream, for this we have `/killFastestUpstream` in mockController:
```
$ curl -s http://localhost:5000/killFastestUpstream | jq .
{
  "status": "OK",
  "id": 3000
}
```
we killed upstream with ID 3000. now testing again:
```
$ curl -s -X POST http://localhost:8080/changePassword | jq .
{
  "id": 3001
}
```


## Metrics
`/metrics` endpoint returns Promethus format metrics, documented in './src/lib/exporter.js':
* boldlabancer_request_time
* boldlabancer_error_counter
* boldlabancer_request_counter
* boldlabancer_upstream_request_counter

```
curl localhost:8080/metrics
```

## healthCheck
`/health` endpoint returns status 200:

```
curl -s  http://localhost:8080/health
```
