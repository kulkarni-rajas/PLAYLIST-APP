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
});

var Playlist = mongoose.model("Playlist", playlistSchema);

var songSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
});

var Song = mongoose.model("Song", songSchema);



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
			//	console.log(result["data"][0]["artist"]["name"]);
			    result["data"].forEach(function(song){
					Song.create({
						   name: song["title"],
						   artist: song["artist"]["name"],
                           audio:  song["preview"],
						}, function(err, asong){
							if(err){
								console.log(err);
							} else {
							//	console.log(asong);
							}
						});
				})
		
				Song.find({}, function(err, songs){
					if(err){
						console.log("ERROR!");
						console.log(err);
					} else {
					//	console.log(typeof songs)
					//	console.log(songs);
						res.render("list", {Song: songs});
					}
				});
				
        });

	  
});

	app.get("/addplaylist/:id",function(req,res){
	
		console.log("id addroute has veen hit");
		console.log(req.params.id);
		res.render("playlist");
	});



app.listen(3000,function(){
	console.log("doof says yes")
});
