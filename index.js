'use strict';

var debug = require('debug')('plugin:contest');
// var moment = require('moment-timezone')

module.exports.init = function(config, logger, stats) {

    return {
        onrequest: function(req, res, next) {
            req.connectivityTest = false;
            var proxyName = res.proxy.name;
            var proxyConfig = config.proxies[proxyName];
            if (proxyConfig) {
                debug("connectivity test configured for proxy " + proxyName);
                var proxyPath = proxyConfig.proxyPath;
                var method = proxyConfig.requestMethod;
                debug("config connectPath: " + proxyPath);
                debug("config verifyPath: " + proxyConfig.verifyPath);
                debug("targetPath: " + req.targetPath);
                if (req.targetPath === proxyPath && req.method === method) {
                    debug("Connectivity test requested");
                    req.targetPath = proxyConfig.targetPath || req.targetPath;
                    req.method = proxyConfig.targetMethod || req.method;
                    if (proxyConfig.targetEndpoint) {
                        var targetEndpoint = proxyConfig.targetEndpoint;
                        req.targetPort = targetEndpoint.targetPort || req.targetPort;
                        req.targetSecure = targetEndpoint.hasOwnProperty("targetSecure") ? targetEndpoint.targetSecure : req.targetSecure;
                        req.targetHostname = targetEndpoint.targetHostname || req.targetHostname;
                    }
                    var url = ( req.targetSecure ? "https://" : "http://" ) + req.targetHostname + ":" + req.targetPort + req.targetPath;
                    debug("Connectivity test to " + req.method + " " + url);
                    req.connectivityTest = true;
                }
                else if (req.targetPath == proxyConfig.verifyPath && req.method === proxyConfig.verifyMethod) {
                    res.writeHead(200, {'Content-Type': 'application/json'})
                    res.write(JSON.stringify({message: "Verified!"}, null, 4));
                    res.end();
                    debug("Verify test requested");
                    return;
                }
            } else {
                debug("connectivity test not configured for proxy " + proxyName);
            }
            next();
        },

        ondata_request: function(req, res, data, next) {
            next(null, data);
        },

        onend_request: function(req, res, data, next) {
            next(null, data);
        },

        onresponse: function(req, res, next) {
            next();
        },

        ondata_response: function(req, res, data, next) {
            if (req.connectivityTest) {
                next(null, null);
            } else {
                next(null, data);
            }
        },

        onend_response: function(req, res, data, next) {
            if (req.connectivityTest) {
                if (res.statusCode === 200) {
                    // var date = moment.utc(Date.now());
                    // date.tz("America/Chicago");
                    // var detailed = "Proxy " + res.proxy.name + " responding to ping at " + date.format("MMDDYYYY HH mm ss") + " CST Client credentials passed test";
                    // next(null, JSON.stringify({message: "Connection OK!", detailed: detailed}, null, 4));
                    next(null, JSON.stringify({message: "Connection OK!"}, null, 4));
                } else {
                    next(null, JSON.stringify({message: "Error reaching backend service"}, null, 4));
                }
            } else {
                next(null, data);
            }
        }
    };
};
