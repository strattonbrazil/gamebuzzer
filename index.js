console.log('index.js initialized');

var fs = require('fs');
// express, the library from which we are going to use some tools
var express = require('express');
// express() is a constructor, calling 'var app' actually builds the app
var app = express();
// when you get a 'post' request, parse it for me and put it in the request object
var bodyParser = require('body-parser');
app.use(bodyParser());

var cookieParser = require('cookie-parser');
app.use(cookieParser());
//TODO should we encrypt or sign our cookies?

function isValidName (name) {
    return name != '';
};

var names = fs.readFileSync("randomWords").toString().split('\n').filter(isValidName);
console.log(names);

var databases = {};

app.set('view engine', 'ejs');

app.set('views', __dirname + '/templates');


// loads page one
app.get('/', function (req, res) {
    res.render('main');
});

// leaves page one
app.post('/g', function (req, res)  {
    console.log(req.body.groupNameText);
    var groupName = req.body.groupNameText;
    var id = undefined;
    while (id == undefined)    {
        var temp = Math.round(1000000000*Math.random());
        if (temp in databases == false)   { // if you don't find the variable temp in the databases dictionary ...
            id = temp;
        };
    };

    // old var id = Math.round(1000000000*Math.random());
    databases[id] = req.body.groupNameText;
    // TODO what if they already have the cookie set ... want to redirect them, send them page Two template ...
    res.cookie('buzztime', 5);
    // document.cookie='gamemaster';   // should I set that as the groupName for security? so someone can't start a game and then switch games?
    res.redirect('/g/' + id);
});

// loads page two
// ":" indicates "something here" not a specific reference to whats behind the slash
app.get('/g/:id', function (req, res)   {
    var gameid = req.params.id;


    // TODO make sure gameid actually exists in the database, otherwise redirect to page not found or back to start
    console.log(gameid);
    var gamename = databases[gameid];
    console.log(gamename);
    console.log(req.cookies.buzztime);
    // TODO set cookie to unique gameID, have it last for a day

    // if gamemaster then render pageTwo, else render page 3;

    if (req.cookies.buzztime == 5)    {
        res.render('pageTwo', { 'gamename' : gamename, 'gameid' : gameid });
    }   else {
        res.render('pageThree', { 'gamename' : gamename, 'gameid' : gameid });
    };


});



// so at this url one person will be a gamemaster and all others will be players
// serve different templates to different people, same URL
// res.render('verb', {title: verbName, subtitle: description})

// when you see someone trying to GET /static change that directory to /public
app.use('/static', express.static(__dirname + '/public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
// anonymous function is a start callback

//
// '/' and '/article' are addresses or protocols to follow ...
// the anononymous functions are protocols you apply to WHATEVER gets sent that way
