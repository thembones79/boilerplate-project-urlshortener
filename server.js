"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var myDatabase = mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true }
);
var theLastNumber = 0;
var cors = require("cors");
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

////////////////////////////////////////////////////////////////////////////////////////////
/// database initialisation

var Schema = mongoose.Schema;

var linkDatabaseSchema = new Schema({
  orginal_url: {
    type: String,
    required: true
  },
  short_url: Number,
  secret: String
});

var LinkDatabase = mongoose.model("LinkDatabase", linkDatabaseSchema);

////////////////////////////////////////////////////////////////////////////////////////////

//// simplest error handler
function handleError(e) {
  console.log(e);
}

/// adds new record into database
function saveRecord(orginalLink, shortLink) {
  let linkDatabase = new LinkDatabase({
    orginal_url: orginalLink,
    short_url: shortLink,
    secret: process.env.SECRET
  });
  linkDatabase.save(function(err) {
    if (err) return handleError(err);
    // saved!
  });
}

/// finds the highest shorturl number in link database and puts it in the callback fuction
var findLastNumber = function(done) {
  LinkDatabase.find({ secret: process.env.SECRET }) ///added constant to every record because i don't know (yet) equivalent of sql's SELECT * FROM
    .sort({ short_url: -1 })
    .limit(1)
    .exec(function(err, data) {
      if (err) {
        console.log(err);
      }
      done(data[0].short_url);
    });
};

var dns = require("dns");

///parser init
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/// takes url from the form and returns an objest with the url adn equivalent short link number
app.post("/api/shorturl/new", urlencodedParser, function(req, res, next) {
  var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
  var hasUrlFormat = urlPattern.test(req.body.url);

  /// checks if given url has valid format
  if (hasUrlFormat) {
    /// checks if host exists
    dns.lookup(req.body.url.substring(8), function(err, addresses, family) {
      if (err) res.json({ error: "invalid host" });
    });

    /// creates new object, saves it and returns it in result of request
    var jsonifyLastNumber = function(lastNumber) {
      let incrementedShortUrl = lastNumber + 1;
      let nameObject = { lastNumber: incrementedShortUrl, link: req.body.url };
      saveRecord(req.body.url, incrementedShortUrl);
      res.json(nameObject);
      next();
    };

    findLastNumber(jsonifyLastNumber); /// execute :)
  } else {
    res.json({ error: "invalid URL" });
  }
});

/// middleware that redirects from shortlink number to the orginal url
app.get("/api/shorturl/:shortLinkNumber", function(req, res) {
  let shortLinkNo = parseInt(req.params.shortLinkNumber, 10);

  /// takes short link number and returns associated orginal url to the callback
  function findOrginalLinkByShortLinkNumber(shortLinkNumber, done) {
    LinkDatabase.find({ short_url: shortLinkNumber })
      .limit(1)
      .exec(function(err, data) {
        if (err) {
          console.log(err);
        }
        done(
          data
            ? data[0].orginal_url
            : res.json({ error: "No short url found for given input" })
        );
      });
  }

  var rangeValidator = function(highestShortlinkNumber) {
    let numberRegex = /^[0-9]*$/;
    let hasNumbersOnly = numberRegex.test(req.params.shortLinkNumber);
    let userInput = parseInt(req.params.shortLinkNumber, 10);

    if (
      userInput < 90 ||
      userInput > highestShortlinkNumber ||
      !hasNumbersOnly
    ) {
      console.log(hasNumbersOnly);
      res.json({ error: "No short url found for given input" });
    }
  };

  /// redirects to the given url
  var redirection = function(orgLink) {
    res.redirect(orgLink);
  };

  findLastNumber(rangeValidator); // validate shortlink number range
  findOrginalLinkByShortLinkNumber(shortLinkNo, redirection); /// execute redirection:)
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
