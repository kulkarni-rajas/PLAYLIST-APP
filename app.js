var express = require('express');  
var bodyParser = require('body-parser');  
var mongodb = require('mongodb'),  
    MongoClient = mongodb.MongoClient;
var assert = require('assert');  
var util=require('util');
var song;
var unirest = require("unirest");
var reqd = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");
var app = express();  
 var result;

app.set('view engine', 'ejs');
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));





app.get("/", function(req, res){
        res.render("landing");

});

app.get("/list",function(req,res){
	song=req.query.search;
	 //console.log(song);
			reqd.query({
			"q": "" + song+ ""
		});

		reqd.headers({
			"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
			"x-rapidapi-key": "45eff3d17amsha881e5fec2254d6p1b4718jsn949ef4e06f56"
		});
		
	    reqd.end(function (resd) {
			 if (resd.error) throw new Error(resd.error);
				result= resd.body;
				console.log(result["data"][0]["artist"]["name"]);
				// resd.render("list", {result: result});
				res.render("list", {result: result});
        });

	  
});



app.listen(3000,function(){
	console.log("doof says yes")
});
