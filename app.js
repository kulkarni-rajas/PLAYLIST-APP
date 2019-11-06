var express = require('express');  
var bodyParser = require('body-parser');  
var mongodb = require('mongodb'),  
  MongoClient = mongodb.MongoClient;
var assert = require('assert');  
var util=require('util');
var song;

var app = express();  
app.set('view engine', 'ejs');
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function(req, res){
        res.render("landing");

});


 app.get("/list",function(req,res){
	song=req.query.search;
	 console.log(song);
	 console.log(typeof song);
});


var unirest = require("unirest");

var req = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");

req.query({
	"q": ""+song+""
});

req.headers({
	"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
	"x-rapidapi-key": "45eff3d17amsha881e5fec2254d6p1b4718jsn949ef4e06f56"
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);
    var result= res.body;
//	console.log("ziga ziga");
	console.log(result["data"]);
});
app.listen(3000,function(){
	console.log("doof says yes")
});
