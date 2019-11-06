var express = require('express');  
var bodyParser = require('body-parser');  
var mongodb = require('mongodb'),  
    MongoClient = mongodb.MongoClient,
	assert = require('assert'),
    util=require('util'),
	song,
    unirest = require("unirest"),
	reqd = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search"),
	app = express(),  
	result,
    obj2 ;

app.set('view engine', 'ejs');
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/playlist_app");

var playlistSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
   id:     Number
});

var Playlist = mongoose.model("Playlist", playlistSchema);



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
			    obj2= JSON.parse(JSON.stringify(result));
			   //console.log(obj2);
				console.log(result["data"][0]["artist"]["name"]);
				// resd.render("list", {result: result});
				res.render("list", {result: result});
        });

	  
});

//console.log(obj2["data"]);
app.get("/addplaylist/:id",function(req,res){
	// var ans=req.body.song;
	// console.log(ans);
	var agreementId = req.params.id;
	console.log(agreementId);
	console.log("hello");
	res.redirect("/list");
});



app.listen(3000,function(){
	console.log("doof says yes")
});
