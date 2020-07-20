function getArticles() {
  if (window.location.pathname === "/") {
    $("#articles").empty();
    $.getJSON("/api/articles", function (data) {
      displayArticles(data, false);
    });
  }

  if (window.location.pathname === "/saved") {
    $("#saved-articles").empty();
    $.getJSON("/api/saved-articles", function (data) {
      displayArticles(data, true);
    });
  }

  function displayArticles(data, getSaved) {
    // Display the articles on the page
    data.forEach((e) => {
      // Create div to hold article data
      var articleDiv = $("<div class='article'>");

      // Build proper URL
      var linkUrl = `https://www.reuters.com/${e.link}`;

      // Create <a> tag to hold link
      var article = $(`<a target="_blank" class="article" href="${linkUrl}">`);

      // Append article to DOM
      article.append(e.title);
      articleDiv.append(article);

      if (getSaved) {
        // Create delete from saved button for each earticle
        var deleteButton = $(
          `<button class='delete-button' data-id=${e._id}>Delete from saved</button>`
        );
        articleDiv.append(deleteButton);
        $("#saved-articles").append(articleDiv);
      } else {
        // Create save button for each article
        var saveButton = $(
          `<button class='save-button' data-id=${e._id}>Save article</button>`
        );
        articleDiv.append(saveButton);
        $("#articles").append(articleDiv);
      }
    });
  }
}

$("#scrape-articles").on("click", function (event) {
  event.preventDefault();

  if ($("#articles").is(":empty")) {
    $.ajax({
      method: "GET",
      url: "/api/scrape",
    }).then(function (data) {
      console.log(data);
      getArticles();
    });
  }
});

$("#clear-articles").on("click", function (event) {
  event.preventDefault();
  $.ajax({
    method: "DELETE",
    url: "/api/clear",
  }).then(function (data) {
    console.log(data);
    getArticles();
  });
});

$(document).on("click", ".save-button", function (event) {
  event.preventDefault();
  $.ajax({
    method: "PUT",
    url: `/api/save/${$(this).data("id")}`,
  }).then(function (data) {
    console.log(data);
    getArticles();
  });
});

$(document).on("click", ".delete-button", function (event) {
  event.preventDefault();
  $.ajax({
    method: "PUT",
    url: `/api/delete/${$(this).data("id")}`,
  }).then(function (data) {
    console.log(data);
    getArticles();
  });
});

// Get any articles from database upon page load
getArticles();
