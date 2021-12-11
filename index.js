const http = require('http');
const app = require('./app');
const express = require("express");
const port = process.env.PORT || "8080";
const host = '0.0.0.0';
const server = http.createServer(app);
app.use(express.static(process.cwd()+"/frontend/safedepositfrontend"));
server.listen(port, host, ()=>{
    console.log('Application running on localhost:'+port)
});