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

// Get articles from MongoDB
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Scrape articles from Reuters
app.get("/scrape", function (req, res) {
  axios.get("https://www.reuters.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("h2.story-title").each(function (i, element) {
      getArticleData(element);
    });

    $("h3.story-title").each(function (i, element) {
      getArticleData(element);
    });

    function getArticleData(element) {
      var result = {};

      var title = $(element).text().trim();
      var link = $(element).parent().attr("href");

      // Reuters has some links as parents and some as children of the story-title header
      // If the link is undefined when trying to grab from the header's parent, try to grab from the header's children
      if (!link) {
        link = $(element).children().attr("href");
      }

      if (title !== "" && link) {
        result.title = title;
        result.link = link;

        db.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    }

    res.send("Scrape completed!");
  });
});

app.delete("/clear", function (req, res) {
  db.Article.deleteMany({})
    .then(function (dbArticle) {
      console.log(dbArticle);
      res.send("Articles cleared!");
    })
    .catch(function (err) {
      console.log(err);
      res.send("An error occurred while clearing the articles.");
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
