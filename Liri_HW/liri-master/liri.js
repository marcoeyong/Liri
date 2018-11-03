require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var request = require("request");
var moment = require('moment');
moment().format();
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

var command = process.argv[2];

// Log the results both in the console aand in log.txt
function logThis(string) {
  fs.appendFile("log.txt", string, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log(string);
  })
}

// Pull band data
function concertThis(artistName) {

  if (process.argv[3]) {
    var artistNameArr = [];
    for (var i = 3; i < process.argv.length; i++) {
      artistNameArr.push(process.argv[i]);
    }
    var artistName = artistNameArr.join("+");
  }

  var queryUrl = "https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp";

  request(queryUrl, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      var artistData = JSON.parse(body);
      for (var i = 0; i < artistData.length; i++) {
        var venueNameStr = "Venue: " + artistData[i].venue.name;
        var locationStr = "Location: " + artistData[i].venue.city + ", " + artistData[i].venue.country;
        // if a region is declared, update the location to include it
        if (artistData[i].venue.region) {
          locationStr = "Location: " + artistData[i].venue.city + ", " + artistData[i].venue.region + ", " + artistData[i].venue.country;
        }
        // convert date substring to MM/DD/YYYY format using "L" format
        var date = moment(artistData[i].datetime.substring(0, 10)).format("L");
        var dateStr = "Date: " + date + "\n";

        var result = 
          "\n" + venueNameStr +
          "\n" + locationStr +
          "\n" + dateStr +
          "\n--------------------------\n";

        logThis(result);
      }
    }
  });
}

// Pull Spotify data
function spotifyThis(trackName) {

  if (process.argv[3]) {
    var trackNameArr = [];
    for (var i = 3; i < process.argv.length; i++) {
      trackNameArr.push(process.argv[i]);
    }
    var trackName = trackNameArr.join("+");
  }
  
  spotify.search({ type: 'track', query: trackName }, function(err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }

    var trackData = data.tracks.items;

    // For each track item
    for (var i = 0; i < trackData.length; i++) {
      var artists = [];

      // Loop through the artists in each album
      for (var j = 0; j < trackData[i].album.artists.length; j++) {
        artists.push(trackData[i].album.artists[j].name);
      }
      
      var songName = trackData[i].name;
      var previewURL = trackData[i].preview_url;
      var albumName = trackData[i].album.name;

      var result = 
        i +
        "\nArtist(s): " + artists +
        "\nSong name: " + songName +
        "\nPreview song: " + previewURL +
        "\nAlbum: " + albumName +
        "\n---------------------------\n";

      logThis(result);
    }
  })
}

// Pull movie data
function movieThis(movieName) {

  var movieNameArr = [];

  // No argument passed
  if (!movieName) {
    // Default movie will be Mr. Nobody
    movieName = "Mr. Nobody";
  }

  if (process.argv[3]) {
    var movieNameArr = [];
    for (var i = 3; i < process.argv.length; i++) {
      movieNameArr.push(process.argv[i]);
    }
    var movieName = movieNameArr.join("+");
  }

  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, (error, response, body) => {
    if(!error && response.statusCode === 200) {
      var movieData = JSON.parse(body);

      var imdbRating = movieData.Ratings[0] ? movieData.Ratings[0].Value : "N/A";
      var rottenTomatoesRating = movieData.Ratings[1] ? movieData.Ratings[1].Value : "N/A";

      var result = 
        "Title: " + movieData.Title + "\n" +
        "Release Year: " + movieData.Year + "\n" +
        "IMDB: " + imdbRating + "\n" +
        "Rotten Tomatoes: " + rottenTomatoesRating + "\n" +
        "Country: " + movieData.Country + "\n" +
        "Language: " + movieData.Language + "\n" +
        "Plot: " + movieData.Plot + "\n" +
        "Actors: " + movieData.Actors + "\n" +
        "---------------------------\n";

      logThis(result);
    }
  });
}

function doWhatItSays() {
  var commandArr = [];
  fs.readFile("random.txt", "utf8", function(err, data){
    commandArr = data.split(" ");
    command = commandArr.shift();
    var queryFromFile = commandArr.join(" ");

    run(queryFromFile);
  });
}

function run(queryFromFile) {
  switch (command) {
    case 'concert':
      concertThis(queryFromFile);
      break;
    case 'spotify':
      spotifyThis(queryFromFile);
      break;
    case 'movie':
      movieThis(queryFromFile);
      break;
    case 'random':
      doWhatItSays();
      break;
    default:
      console.log("Not a valid query");
  }
}

run();