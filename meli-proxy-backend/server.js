const loki = require('lokijs');
const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();
var ipCollection;
var lastRequestsCollection;
var methodsCollection;

var appConfig = require('./config/appConfig');

var db = new loki('sandbox.db',{
    autoload: true,
    autoloadCallback: databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize(){
    ipCollection = db.getCollection('ips');
    if(ipCollection === null){
        ipCollection = db.addCollection('ips');
    }
    lastRequestsCollection = db.getCollection('lastRequests');
    if(lastRequestsCollection === null){
        lastRequestsCollection = db.addCollection('lastRequests');
    }
    methodsCollection = db.getCollection('methods');
    if(methodsCollection === null){
        methodsCollection = db.addCollection('methods');
    }
    console.log("Database initialized");
}

var onProxyReq = function(proxyReq, req, res)
{
    console.log("Incoming request");
    var remoteAddress = req.connection.remoteAddress;
    var addVec = remoteAddress.split(':');
    if(addVec[3] != ""){
        remoteAddress = addVec[3];
    }
    if(appConfig.ENABLE_TRACE){
        console.log(remoteAddress);
    }
    var ban = verifyIfShouldBan(remoteAddress);
    if(ban){
        console.log("Ban enabled, connection not allowed");
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.sendStatus(403);
        proxyReq.abort();
    }else{
        saveIp(remoteAddress);
    }
    methodStatistics(req);
    lastRequestStatistics(remoteAddress);
};

function saveIp(remoteAddress){
    var ip = ipCollection.findOne({'remoteAddress':remoteAddress});
    if(ip != null)
    {
        ip.connectionCount++;
        ip.lastConnection = new Date();
        ipCollection.update(ip);
        if(appConfig.ENABLE_TRACE){
            console.log(ip);
        }
    }else{
        if(appConfig.ENABLE_TRACE){
            console.log("IP not found, adding it");
        }
        var date = new Date();
        ip = {'remoteAddress': remoteAddress, 'connectionCount': 1, 'lastConnection': date};
        ipCollection.insert(ip);
    }
}

function verifyIfShouldBan(remoteAddress){
    var requestCount = lastRequestsCollection.where(function (rc){
        var datediff = ((new Date) - new Date(rc.lastConnection));
        if(appConfig.ENABLE_TRACE){
            console.log("Date diff: " + datediff + ", FIVE_MINUTES" + appConfig.AUTO_BAN_TIME);
        }
        return rc.remoteAdress === remoteAddress && datediff < appConfig.AUTO_BAN_TIME;
    });
    if(appConfig.ENABLE_TRACE){
        console.log("Req Count: " +  requestCount.length);
    }
    return appConfig.AUTO_BAN && requestCount.length > appConfig.AUTO_BAN_COUNT;
}

function lastRequestStatistics(remoteAddress){
    var date = new Date();
    var lr = {'remoteAdress': remoteAddress, 'lastConnection': date};
    lastRequestsCollection.insert(lr);
}

function methodStatistics(req){
    var method = methodsCollection.findOne({'url': req.url, 'method': req.method});
    if(method != null){
        method.meter++;
        method.lastUpdate = new Date();
        methodsCollection.update(method);
    }else{
        var date = new Date();
        var m = {'url': req.url, 'method': req.method, 'meter': 1, 'lastUpdate': date};
        methodsCollection.insert(m);
    }
}

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/proxy/methods", function(req,res){
    var m = methodsCollection.chain().find({'meter': {'$gt':0}}).simplesort('meter', true).limit(10).data();
    if(m != null){
        res.json(m);
    }else{
        res.sendStatus(404);
    }
});

app.get("/proxy/lastRequest", function(req, res){
    var lr = lastRequestsCollection.where(function(rc){
        var datediff = ((new Date) - new Date(rc.lastConnection));
        return datediff < appConfig.AUTO_BAN_TIME;
    });
    console.log(lr);
    if(lr != null){
        res.json(lr);
    }else{
        res.sendStatus(404);
    }
});

app.get("/proxy/statistics", function(req, res){
    var ips = ipCollection.chain().find({'connectionCount': {'$gt':0}}).simplesort('connectionCount', true).limit(10).data();
    if(ips != null){
        res.json(ips);
    }else{
        res.sendStatus(404);
    }
});

app.use('/*', proxy({
    target: appConfig.API_URL,
    changeOrigin: true,
    onProxyReq: onProxyReq
}));

app.listen(appConfig.PORT, () => {
    console.log('Listening on: http://localhost:' + appConfig.PORT);
});

