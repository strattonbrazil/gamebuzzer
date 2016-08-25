console.log('index.js initialized');

// TODO make gameIDs treated as lower caps, shown as each-word-capitalized

var fs = require('fs'); // express, the library from which we are going to use some tools
var express = require('express');   // express() is a constructor, calling 'var app' actually builds the app
var app = express(); // when you get a 'post' request, parse it for me and put it in the request object
var bodyParser = require('body-parser');
app.use(bodyParser());

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var http = require('http').Server(express);
var io = require('socket.io')(http);

var spaceport = 3000;
var socketear = 3001;

//TODO should we encrypt or sign our cookies?

var databases = {};

app.set('view engine', 'ejs');

app.set('views', __dirname + '/templates');

// loads page one
app.get('/', function (req, res) {
    res.render('landing');
});

function isValidName (name) {
    return name != '';
};

function generateID()   {
    var randomWords = fs.readFileSync("randomWords").toString().split('\n').filter(isValidName);
    var generatedID = undefined;
    while (generatedID == undefined) {
        var random3 = undefined;
        while (random3 == undefined) {
            // TODO write function returning random element in array
            var randomA = randomWords[Math.floor(Math.random()*randomWords.length)];
            var randomB = randomWords[Math.floor(Math.random()*randomWords.length)];
            var randomC = randomWords[Math.floor(Math.random()*randomWords.length)];
            if (randomA != randomB && randomB != randomC && randomC != randomA) {   // if none of those words match ...
                random3 = randomA + randomB + randomC;  // make
            };
        };  // end of while loop generating 3 random words and forming them into a single string
        if (random3.toLowerCase() in databases == false)  {   // if the random word is not in the database
            generatedID = random3;
        };
    };  // end of while loop defining generatedID
    console.log('variable generatedID upon leaving generateID is ' + generatedID);
    return generatedID;
};  // end of generateID

// leaves page one
app.post('/g', function (req, res)  {
    console.log(req.body.groupNameText);
    var groupName = req.body.groupNameText;
    var id = generateID();
    databases[id] = req.body.groupNameText;
    console.log('databases id is '+ databases[id]);
    // TODO what if they already have the cookie set ... want to redirect them, send them page Two template ...
    res.cookie('buzztime', 5);
    // document.cookie='gamemaster';   // should I set that as the groupName for security?
    res.redirect('/g/' + id);
}); // end of app.post

// loads page two
// ":" indicates "something here" not a specific reference to whats behind the slash
app.get('/g/:id', function (req, res)   {
    var gameid = req.params.id;
    // TODO make sure gameid actually exists in the database, otherwise redirect to page not found or back to start
    console.log('gameid is ' + gameid);
    var gamename = databases[gameid];
    // TODO set cookie to unique gameID, have it last for a day

    // if gamemaster then render pageTwo, else render page 3;
    if (req.cookies.buzztime == 5)    {
        var joinUrl = req.get('host') + req.path;
        res.render('owner', { 'gamename' : gamename, 'gameid' : gameid, 'joinUrl' : joinUrl });
    }   else {
        res.render('player', { 'gamename' : gamename, 'gameid' : gameid });
    };
}); // end of app.get

// so at this url one person will be a gamemaster and all others will be players
// serve different templates to different people, same URL
// res.render('verb', {title: verbName, subtitle: description})

// when you see someone trying to GET /static change that directory to /public
app.use('/static', express.static(__dirname + '/public'));


app.listen(spaceport, function () {
  console.log('gameBuzzer listening for GETS on port: ' + spaceport);
});
// anonymous function is a start callback

http.listen(socketear, function(){
  console.log('gameBuzzer listening for socket io on port: ' + socketear);
});

io.on('connection', function(socket){
  console.log('console log a user connected');
  socket.emit('announcements', { message: 'A new user has joined!' });
  socket.on('event', function(data) {
       console.log('A client sent us this dumb message:', data.message);
  };
});
