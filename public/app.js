$("#scrape-articles").on("click", function (event) {
  event.preventDefault();

  $.getJSON("/articles", function (data) {
    // Display the articles on the page
    console.log(data);
    data.forEach((e) => {
      var article = $("<div class='article'>");
      article.append(e.title);
      $("#articles").append(article);
    });
  });
});
