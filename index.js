var express = require('express');
var app = express();

const port = process.env.PORT || 3000;

app.get("/toto", function(req, res){
    res.send("salut totot");
});


app.listen(port, function(){
    console.log('serveur listening on port : ' +port);
});
