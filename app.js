var express     = require('express');  
var bodyParser  = require('body-parser');  
var mongodb     = require('mongodb'),  
    MongoClient = mongodb.MongoClient,
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
    unirest     = require("unirest"),
	reqd        = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search"),
	app = express(),  
	result,song,obj2 ;

app.set('view engine', 'ejs');
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/playlist_app");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose)

var User = mongoose.model("User", UserSchema);

app.use(require("express-session")({
    secret: "playlist app",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

var playlistSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
});

var Playlist = mongoose.model("Playlist", playlistSchema);

var playlistSCSchema = new mongoose.Schema({
   name:   String,
   playlist: [playlistSchema]
});

var PlaylistSC = mongoose.model("PlaylistSC", playlistSCSchema);

var songSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
});

var Song = mongoose.model("Song", songSchema);

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

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
			//console.log(result["data"][0]);
			    result["data"].forEach(function(song){
					
					Song.create({
						   name:   song["title"],
						   artist: song["artist"]["name"],
					       audio:  song["preview"],
						}, function(err, asong){
							if(err){
								console.log(err);
							} else {
								console.log(asong);
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
						res.render("list",{Song: songs});
					}
				});
			});
});

	app.get("/addplaylist/:id",isLoggedIn,function(req,res){
		var idp=req.params.id;
	     PlaylistSC.find({}, function(err, songs){
			if(err){
				console.log("ERROR!");
				console.log(err);
			} else {
			//	console.log(typeof songs)
			//	console.log(songs);
				res.render("playlist_sc",{playlists: songs,idp:idp});
			}
		});
	});

app.get("/newplaylist/:id",function(req,res){
	var idp= req.params.id;
	var name= req.query.plyname;
	console.log(name);
//	res.redirect("");
	PlaylistSC.create({
	   name:   name,
	}, function(err, asong){
		if(err){
			console.log(err);
		} else {
			console.log(asong);
		}
	});
				
	PlaylistSC.find({}, function(err, songs){
		if(err){
			console.log("ERROR!");
			console.log(err);
		} else {
		//	console.log(typeof songs)
			console.log(songs);
			res.render("playlist_sc",{playlists: songs,idp:idp});
		}
	});
	
});

	
app.get("/showplay/:ida/:idb",function(req,res){

		console.log(req.params.ida);
	    console.log(req.params.idb);
	
		
		PlaylistSC.findById(req.params.idb,function(err,foundPly){
			if(err){
				console.log(err);
			}
			else{
			   //    console.log(foundPly);
				   Song.findById(req.params.ida,function(err,foundSong){
					  if(err){
						console.log(err);
					   }
					  else{
						  console.log(foundSong);
						  var currply=foundPly;
						  currply.playlist.push({
							 name:   foundSong["name"],
							 artist: foundSong["artist"],
							 audio:  foundSong["audio"],

						});
						  currply.save();
					  }
			
		          });
			
			}
			console.log(foundPly)
		});
		
		
 	});
app.get("/playlist",isLoggedIn,function(req,res){
		PlaylistSC.find({}, function(err, songs){
		if(err){
			console.log("ERROR!");
			console.log(err);
		} else {
		//	console.log(typeof songs)
			console.log(songs[0]);
			res.render("playlist_view",{Song: songs});
		}
	});
	
});

app.get("/playlist/:id",function(req,res){
	var id= req.params.id;
	PlaylistSC.findById( id, function(err, songs){
		if(err){
			console.log("ERROR!");
			console.log(err);
		} else {
		//	console.log(typeof songs)
			res.render("song_view",{Song: songs});
		}
	});
	
});

// app.get("/playlistCV",function(req,res){
		
// 	Playlist.find({}, function(err, songs){
// 		if(err){
// 			console.log("ERROR!");
// 			console.log(err);
// 		} else {
// 			res.render("playlist",{Song: songs});
// 		}
// 		});
	
// });


app.post("/back",function(req,res){
	Song.deleteMany({}, function (err) {
	  if (err) return handleError(err);
	});
	res.redirect("/");
});

app.post("/delete/:id",function(req,res){
	Playlist.deleteOne({id:req.params.id}, function(err){
	  if (err) console.log(err);
		
	});
	res.redirect("/playlist");
});


// show register form
app.get("/register", function(req, res){
   res.render("signup"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/login");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000,function(){
	console.log("doof says yes");
});