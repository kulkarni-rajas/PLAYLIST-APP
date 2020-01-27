var songaud= [];
var songname=[];
var songimg=[];

var currentSong = 0;

Playlist.playlist.forEach(function(song2) {

    songaud[currentSong]= song2["audio"];
    songname[currentSong]=song2["name"];
    songimg[currentSong]= song2["image"];
    currentSong++;

});

currentSong=0;

var songTitle = document.getElementById('songTitle');
var songSlider = document.getElementById('songSlider');
var currentTime = document.getElementById('currentTime');
var duration = document.getElementById('duration');
var volumeSlider = document.getElementById('volumeSlider');
var nextSongTitle = document.getElementById('nextSongTitle');
var songImg = document.getElementById('songImg');

var song = new Audio();

window.onload = loadSong;

function playCurrent(audio1){
    for( i =0; i< songaud.length; i++)
    {
        if(audio1.equals(songaud[i]))
                currentSong = i;


    }

    loadSong();
}

function loadSong(){
    song.src = songaud[currentSong] ;
    songTitle.textContent = songname[currentSong];
    songImg = songimg[currentSong];
    nextSongTitle.innerHTML = "<b>Next Song: </b>" + songname[currrentSong + 1 % songaud.length];
    song.playbackRate=1;
    song.volume = volumeSlider.value;
    song.play();
}

setInterval(updateSongSlider, 1000);

function updateSongSlider(){
    var c = Math.round(song.currentTime);
    songSlider.value = c;
    currentTime.textContent = convertTime(c);
    if(song.ended){
        next();
    }
}

function convertTime(secs){
    var min = Math.floor(secs/60);
    var sec = secs%60;
    min = (min < 10)? "0" + min : min;
    sec = (sec <10)? "0" + sec : sec;
    return(min + ":" + sec);
}

function showDuration(){
    var d = Math.floor(song.duration);
    songSlider.setAttribute("max", d);
    duration.textContent = convertTime(d);
}

function playOrPauseSong(img){
    song.playbackRate=1;
    if(song.paused){
        song.play();
        img.src="images/pause.png";
     }
     else{
         song.pause();
        img.src="images/play.png";
     }
}


function next(){
    currentSong = currentSong + 1 % songaud.length;
    loadSong();
}

function previous(){
    currentSong--;
    currentSong = (currentSong < 0) ? songaud.length -1 : currentSong;
    loadSong();
}
function seekSong(){
    song.currentTime = songSlider.value;
    currentTime.textContent = convertTime(song.currentTime);

}

function adjustVolume(){
    song.volume = volumeSlider.value;
}

function increasePlaybackRate(){
    song.playbackRate += 0.5;
}


function decreasePlaybackRate(){
    song.playbackRate -= 0.5;
}