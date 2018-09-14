var express = require('express');

let app = express()

app.get('/', function(eq, res){
    res.send("hello world");
});

var port = process.env.PORT || 5000;
app.listen(port, function(){
    console.log("server successfully started");
})