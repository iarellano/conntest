# conntest microgateway plugin

## Summary
Allows to verify API Keys without compromising data from the backend server.

## Functionality
These two endpoints provides two similar features where one is used to verify that edge microgateway is online whilst the other actually connects to the backend and removes any data from the reponse before sending it over to the client consumer.

## Configuration
Add the following to your config yaml file with your own values

```yaml
conntest:
  proxies:
    edgemicro_httpbin: # Proxy name
      proxyPath: '/anything/connect' # Path where microgateway will receive backend connection tests
      requestMethod: 'GET'           # HTTP expected method by microgateway for connection test
      targetPath: '/anything/test'   # Backend path for connection test
      targetMethod: 'POST'           # HTTP expected method by backend for connection test
      verifyPath: '/anything/verify' # Path where microgateway will receive verify requests   
      verifyMethod: 'GET'            # HTTP method for verify requests
      
```