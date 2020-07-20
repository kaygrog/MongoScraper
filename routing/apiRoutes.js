// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("../models");

module.exports = function (app) {
  // Get articles from database
  app.get("/api/articles", function (req, res) {
    db.Article.find({ saved: false })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Get saved articles from database
  app.get("/api/saved-articles", function (req, res) {
    db.Article.find({ saved: true })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Scrape articles from Reuters
  app.get("/api/scrape", function (req, res) {
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
          result.saved = false;

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

  // Delete all articles from database
  app.delete("/api/clear", function (req, res) {
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

  // Save an article
  app.put("/api/save/:id", function (req, res) {
    db.Article.updateOne(
      {
        _id: req.params.id,
      },
      { $set: { saved: true } }
    )
      .then(function (dbArticle) {
        console.log(dbArticle);
        res.send("Article saved!");
      })
      .catch(function (err) {
        console.log(err);
        res.send("An error occurred while saving the article.");
      });
  });

  // Delete an article from saved articles
  app.put("/api/delete/:id", function (req, res) {
    db.Article.updateOne(
      {
        _id: req.params.id,
      },
      { $set: { saved: false } }
    )
      .then(function (dbArticle) {
        console.log(dbArticle);
        res.send("Article deleted from saved articles!");
      })
      .catch(function (err) {
        console.log(err);
        res.send(
          "An error occurred while deleting the article from saved articles."
        );
      });
  });
};
