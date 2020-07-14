var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", function (req, res) {
  res.json(path.join(__dirname, "public/index.html"));
});

app.get("/articles", function (req, res) {
  axios.get("https://www.reuters.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    // TODO: Change below to creating an Article (model) rather than pushing to an array
    var results = [];

    $("h2.story-title").each(function (i, element) {
      getArticleData(element);
    });

    $("h3.story-title").each(function (i, element) {
      getArticleData(element);
    });

    function getArticleData(element) {
      var title = $(element).text().trim();
      var link = $(element).parent().attr("href");

      // Reuters has some links as parents and some as children of the story-title header
      // If the link is undefined when trying to grab from the header's parent, try to grab from the header's children
      if (!link) {
        link = $(element).children().attr("href");
      }

      if (title !== "") {
        results.push({ title: title, link: link });
      }
    }

    res.json(results);
  });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
