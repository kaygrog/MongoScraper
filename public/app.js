function getArticles() {
  $.getJSON("/articles", function (data) {
    // Clear existing articles from page
    $("#articles").empty();

    // Display the articles on the page
    data.forEach((e) => {
      // Create div to hold article data
      var articleDiv = $("<div class='article'>");

      // Build proper URL
      var linkUrl = `https://www.reuters.com/${e.link}`;

      // Create <a> tag to hold link
      var article = $(`<a target="_blank" class="article" href="${linkUrl}">`);

      article.append(e.title);
      articleDiv.append(article);
      $("#articles").append(articleDiv);
    });
  });
}

$("#scrape-articles").on("click", function (event) {
  event.preventDefault();
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).then(function (data) {
    console.log(data);
    getArticles();
  });
});

$("#clear-articles").on("click", function (event) {
  event.preventDefault();
  $.ajax({
    method: "DELETE",
    url: "/clear",
  }).then(function (data) {
    console.log(data);
    getArticles();
  });
});

getArticles();
