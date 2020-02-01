var express     = require('express'),  
    bodyParser  = require('body-parser'),  
    mongodb     = require('mongodb'),  
	MongoClient = mongodb.MongoClient,
	ObjectID    = mongodb.ObjectID,
    passport    = require("passport"),
    LocalStrategy = require('passport-local').Strategy,
	passportLocalMongoose = require("passport-local-mongoose"),
    unirest     = require("unirest"),
	methodOverride= require("method-override"),
	reqd        = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search"),
	app         = express(),  
	flash       = require('connect-flash'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	randomstring  = require('randomstring'),
	mailer = require('./misc/mailer'),
	validator = require('validator'),
	googleSignIn = require('./config/googleSignIn')
	
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.use(flash());

const port = 3000


// connecting to monggose server
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/playlist_app",{ useNewUrlParser: true,useUnifiedTopology: true });

// passport authentication setup
var UserSchema = new mongoose.Schema({
	username: {type:String,index:true,sparse:true},
	password: String,
	email: String,
	Token: String,
	verified : Boolean,
	google: {
	id: String,
	token: String,
	email: String,
	name: String
	}
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

passport.serializeUser(function(user, done) {
	done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
	done(null, user);
  });

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   //console.log(1,res.locals.currentUser)
   next();
});


  //            //
 // ALL MODELS //
//            //   

var playlistSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
   image:  String,	
});

var Playlist = mongoose.model("Playlist", playlistSchema);

var playlistSCSchema = new mongoose.Schema({
   name:   String,
   author: String,	
   playlist: [playlistSchema]
});

var PlaylistSC = mongoose.model("PlaylistSC", playlistSCSchema);

var songSchema = new mongoose.Schema({
   name:   String,
   artist: String,
   audio:  String,
   image:  String,	
});

var Song = mongoose.model("Song", songSchema);



passport.use(new LocalStrategy(User.authenticate()));

passport.use(new GoogleStrategy({
	clientID: googleSignIn.GOOGLE_CLIENT_ID,
	clientSecret: googleSignIn.GOOGLE_CLIENT_SECRET,
	callbackURL: googleSignIn.GOOGLE_CALLBACKURL
  },
  function(accessToken, refreshToken, profile, done) {
		process.nextTick(function(){
			console.log("profile")
			User.findOne({'google.id': profile.id}, function(err, user){
				if(err)
					return done(err);
				if(user)
					return done(null, user);
				else {
					var newUser = new User({
						google:{
							id : profile.id,
					        token : accessToken,
					        name : profile.displayName,
					        email : profile.emails[0].value
						}
					});
					
					console.log("The new User is:",newUser)
					newUser.save(function(err){
						if(err)
							throw err;
						return done(null, newUser);
					})
				}
			});
		});
	}

));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }),
    (req,res)=>{
	});


  
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
	req.flash('success','Successfully signed In,Welcome!!')
	res.redirect('/');
  });




app.get("/", function(req, res){
	user = req.user
	console.log(user)
	if(user && user.verified==false)
	{
		res.redirect("/verify")
	}else{
		res.redirect("/back")
	}
	
});

app.post("/list",function(req,res){
	song=req.body.Search;
	//song="light it up";
	console.log(2,req.body)
	console.log(3,req.body.Search);
	// console.log(song);
			reqd.query({
			"q": "" +song+ ""
		});

		reqd.headers({
			"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
			"x-rapidapi-key": "45eff3d17amsha881e5fec2254d6p1b4718jsn949ef4e06f56"
		});
		
	    reqd.end(function (resd) {
			 if (resd.error) 
			 {throw new Error(resd.error);}
				result= resd.body;
				//console.log(result["data"][0]);
				console.log(3,result)
				const data = result["data"]
				
				data.forEach(function(song){
					
					Song.create({
						   name:   song["title"],
						   artist: song["artist"]["name"],
					       audio:  song["preview"],
						   image:  song["album"]["cover_medium"]
						}, function(err, asong){
							if(err){
								console.log(err);
							} else {
								
								//console.log(asong);
							}
						});
					
				})
			});
	            res.redirect("/list_view");
});

app.get("/list_view",function(req,res){
	
	if(req.user && req.user.verified == false)
	{
		req.flash('verify', `An email has been sent to ${req.user.email}.Please verify your account.`);
        res.redirect("/verify")
	}else{
		
	Song.find({}, function(err, songs){
			if(err){
				console.log("ERROR!");
				console.log(err);
			} else {
				res.render("list",{Song: songs});
			}
		});
	}
});

app.get("/addplaylist/:search/:id",isLoggedIn,function(req,res){
		var idp=req.params.id;
		const search = req.params.search;
		const user = req.user
		//console.log(req.user.username);
		//console.log(5,req.user)
	     PlaylistSC.find({}, function(err, songs){
			if(err){
				console.log("ERROR!");
				console.log(err);
			} else {
			//	console.log(typeof songs)
			//	console.log(songs);
				if(user.google)
				{
					res.render("playlist_sc",{playlists: songs,idp:idp,user:req.user.google.name, search: search});
				}else{
				   res.render("playlist_sc",{playlists: songs,idp:idp,user:req.user.username , search: search});
				}
			}
		});
	});

app.get("/newplaylist/:search/:id",function(req,res){
	var idp= req.params.id;
	const user = req.user;
	if(user.google)
	{
	 var auser = user.google.name
	}else{
	 var auser = user.username
	}
	var name= req.query.plyname;
	console.log(name);
//	res.redirect("");
	PlaylistSC.create({
	   name:   name,
	   author: auser,	
	}, function(err, asong){
		if(err){
			console.log(err);
		} else {
			console.log(auser);
		}
	});
	
	res.redirect("/addplaylist/"+req.params.search+"/"+idp);
	
});

	
app.post("/showplay/:search/:ida/:idb", (req,res)=>{

		
		const ida = req.params.ida;
	    var plyid=req.params.idb;
	    var search = req.params.search;
		console.log(1,req.params.ida);
		console.log(2,req.params.idb);
		console.log(3,search)
		PlaylistSC.findById(req.params.idb,async (err,foundPly)=>{
			if(err){
				return console.log(err);
			}
			
			   //    console.log(foundPly);
			   var req = unirest("GET", "https://deezerdevs-deezer.p.rapidapi.com/search");

			   req.query({
				   "q": search
			   });
			   
			   req.headers({
				   "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
				   "x-rapidapi-key": "69fccf299amshb6e2f8cee3e4649p1e45f5jsn8ba7016e3003"
			   });
			   
			   
			   req.end(async (res) => {
				   if (res.error) 
				   throw new Error(res.error);

				   var data = res.body.data;

			       for(var i=0;i<data.length;i++){
					console.log(4,data[i].id)
					console.log(5,ida)
					if(data[i].id == ida)
					{
						 console.log("found")
						 var currply=foundPly;
						  currply.playlist.push({ 
							name:   data[i].title,
							artist: data[i].artist.name,
							audio:  data[i].preview,
							image:  data[i].album.cover_medium 

					   });
					   await currply.save();
					 
					  break;
					}
				}
			   });
			console.log(6,foundPly)
		});
		req.flash('success','The song was added in the playlist.:)')
		res.redirect("/playlist/"+plyid);
		
		
});
	 

app.get("/playlist",isLoggedIn,function(req,res){
	console.log(req.user)
	if(req.user && req.user.verified == false)
	{   req.flash('verify', `An email has been sent to ${req.user.email} . Please verify your account.`);
        res.redirect("/verify")
	}else{
	
		PlaylistSC.find({}, function(err, playlists){
		if(err){
			console.log("ERROR!");
			console.log(err);
		} else {
		//	console.log(typeof songs)
			const user = req.user;
		
		      if(user.google)
		      {
			   var auser = user.google.name
		      }else{
			   var auser = user.username
			  }
		
			console.log(playlists);
			res.render("playlist_view",{playlists: playlists,user:auser});
		}
	});
    }
});

app.get("/playlist/:id",function(req,res){
	var id= req.params.id;
	const user = req.user;
	if(user.google)
	{
	 var auser = user.google.name
	}else{
	 var auser = user.username
	}
	PlaylistSC.findById( id, function(err, songs){
		if(err){
			console.log("ERROR!");
			console.log(err);
		} else {
		//	console.log(songs.playlist[0])
			if(songs.playlist[0]){
				console.log("yes");
			res.render("song_view",{Playlist: songs,play:songs.playlist[0]["audio"],successMessages:req.flash('success')});
			}
			else{
				console.log("no");
				res.render("song_view",{Playlist: songs,play:null,successMessages:req.flash('success') });
			}
		}
	});
	
});

app.get("/playsong/:ida/:idb",function(req,res){
	//console.log(req.params.idx)
	var ida= req.params.ida;
	var idb= req.params.idb;
		PlaylistSC.findById(req.params.ida,function(err,foundPly){
		if(err){
			console.log(err);
		}
		else{
		      console.log(foundPly);
					foundPly.playlist.forEach(function(foundSong){
					if(foundSong._id==idb){
					  console.log(foundSong);
					  return res.render("song_view",{Playlist: foundPly,play:foundSong["audio"],successMessages:req.flash('success')});
					}

			 });
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

app.delete("/playlist/:id",function(req,res){
	PlaylistSC.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/playlist");
		}
	});
});

// app.delete("/playlist/:ida/:idb",function(req,res){
// 	console.log("------------------------");
// 	console.log(req.params.ida,req.params.idb);
// 	PlaylistSC.findById(req.params.ida,function(err,found){
// 	if(err){
// 			console.log(err);
// 		}
// 		else{
// 			console.log(found["playlist"]);
// 			var foundlist=found["playlist"];
// 			foundlist.findById(req.params.idb,function(err,found2){
// 				console.log(found2);
				
// 			})
// 		}
// 	});
// 	res.redirect("/playlist/"+req.params.ida);
	
// });

app.get("/back",(req,res)=>{
	console.log(req.user)
	res.render("landing",{successMessages : req.flash('success')});
})

app.post("/back",function(req,res){
	Song.deleteMany({}, function (err) {
	  if (err) return handleError(err);
	});
	res.redirect("/back");
});

app.post("/delete/:id",function(req,res){
	Playlist.deleteOne({id:req.params.id}, function(err){
	  if (err) console.log(err);
		
	});
	res.redirect("/playlist");
});

app.get("/register", function(req, res){
	res.render("signup", { alertMessages : req.flash('error') } )
});

//handle sign up logic
app.post("/register",async (req, res) =>{
	
	console.log(4,req.body)
	const{password,confirmPassword,email}=req.body
	
	if(!validator.isEmail(email))
	{
		req.flash('error','Invalid Email')
		return res.redirect('/register')
	}
	console.log("The email is correct")
	if(password===confirmPassword)
	{
		const token = randomstring.generate()
		console.log(token)
	
	var newUser = new User({
		username:req.body.username,
		password:req.body.password,
		Token:token,
		email:email,
		verified:false
		 
		})
		console.log(newUser)
       User.register(newUser,req.body.password,function(err, user){
        if(err){
            console.log(err);
			//return res.render("signup");
			req.flash('error',err.message)
			res.redirect("/register");
        }
         passport.authenticate("local")(req, res, async function(){
		//	 res.send("successfully registered");
			  console.log(user)
			  const html = `Hi there,
                 <br/>
                     Thank you for registering!
                          <br/><br/>
                          Please verify your email by typing the following token:
                               <br/>
                        Token: <b>${token}</b>
                        <br/>
                        On the following page:
                        <a href="http://localhost:${port}/verify">http://localhost:${port}/verify</a>
                         <br/><br/>
                           Have a pleasant day.` 

      // Send email
      await mailer.sendEmail('admin@playpal.com', email, 'Please verify your email!', html);

      req.flash('verify', `An email has been sent to ${email}.Please verify your account.`);
	  res.redirect('/verify');
	  
		});
	});
}else{
	req.flash('error','The passwords do not match!')
	res.redirect('/register') 
}


});

// show login form
app.get("/login",registerLOG, function(req, res){

   res.render("login",{successMessages: req.flash('success'),alertMessages: req.flash('error')}); 
});


app.get('/verify',(req,res)=>{
		 
	if(req.user && req.user.verified==false)
	{ const errors = req.flash("error")
	   console.log(32,errors)
	   res.render("verify", { alertMessages : errors , verifyMessages : req.flash("verify") } )
    }else{
		res.redirect('/')
	}
});

app.post('/verify',async (req,res)=>{

	
   const secretToken = req.body.SecretToken.trim();
   console.log(req.body)
   console.log("The inputted SecretToken is ",secretToken)
   try{
	                                     
	const user = await User.findOne({'Token' : secretToken})
   
	if(!user)
   {  console.log("User not found")
	   req.flash('error','Incorrect verfication code')
	  res.redirect('/verify')
	  return;

   }	 

   console.log("User found") 
   user.verified = true;
   user.Token = 'The_Token_Has_Been_Verified';
   user.save();
   console.log(12,user)
   req.flash('success','Your Verification is now Complete ! Now you can accesss the site :)')
   req.logout();
   res.redirect('/login');
}
 catch(e){
	 console.log(e)
 }

});

app.post('/verify-again',async (req,res)=>{
	
	 const user = req.user
	 const html = `Hi there,
                 <br/>
                     Thank you for registering!
                          <br/><br/>
                          Please verify your email by typing the following token:
                               <br/>
                        Token: <b>${user.Token}</b>
                        <br/>
                        On the following page:
                        <a href="http://localhost:${port}/verify">http://localhost:${port}/verify</a>
                         <br/><br/>
                           Have a pleasant day.` 

      // Send email
      await mailer.sendEmail('admin@playpal.com', user.email, 'Playpal Email Verification!', html);

      req.flash('verify', `An email has been sent to ${user.email}.Please verify your account.`);
	  res.redirect('/verify');
 
 });

// handling login logic
app.post("/login", passport.authenticate("local", 
{
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: 'Invalid username or password.'
}), function(req, res){	
	req.flash('success','You have Successfully signed In!!!')
  console.log("successfully signed In")
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   console.log("you are logging out.")
   req.flash('success','You have successfully logged Out!!')
   res.redirect("/login");
});


app.get('/about', (req,res)=>{
	res.render('about');
})
function isLoggedIn(req, res, next){
	console.log(req.isAuthenticated())
	
	if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function registerLOG(req,res,next){
	if(req.isAuthenticated()){
		res.redirect("/")
		console.log("yes");
    }
	else{
		console.log("no");
		return next();	
		}
}

app.listen(port,function(){
	console.log("The app is active on ",port);
});
