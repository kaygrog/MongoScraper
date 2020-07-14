$("#scrape-articles").on("click", function (event) {
  event.preventDefault();

  $.getJSON("/articles", function (data) {
    // Display the articles on the page
    console.log(data);
    data.forEach((e) => {
      $("#articles").append(e.title);
    });
  });
});
