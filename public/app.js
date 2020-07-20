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
        // Create "Delete from saved" button for each earticle
        var deleteButton = $(
          `<button class='delete-button' data-id=${e._id}>Delete from saved</button>`
        );

        // Create "Article notes" button for each article
        var notesButton = $(
          `<button type='button' class='btn btn-primary notes-button' data-toggle='modal' data-target='#articleNotes' data-id=${e._id}>Article notes</button>`
        );

        articleDiv.append(deleteButton);
        articleDiv.append(notesButton);
        $("#saved-articles").append(articleDiv);
      } else {
        // Create "Save article" button for each article
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

$(document).on("click", ".notes-button", function (event) {
  event.preventDefault();

  $(".article-id").empty();
  $(".saved-notes").empty();
  $(".note-body").val("");
  $(".modal-footer").empty();

  // TODO: Populate article-notes div with saved notes for that article
  var articleId = $(this).data("id");
  $(".article-id").append(articleId);
  $(".modal-footer").append(
    `<button data-id="${articleId}" type="button" class="btn btn-primary save-note" data-dismiss="modal">Save note</button>`
  );

  $.ajax({
    method: "GET",
    url: `/api/article-notes/${articleId}`,
  }).then(function (data) {
    if (data.note) {
      $(".saved-notes").append(data.note.body);
    }
  });
});

$(document).on("click", ".save-note", function (event) {
  event.preventDefault();
  $.ajax({
    method: "POST",
    url: `/api/article-notes/${$(this).data("id")}`,
    data: { body: $(".note-body").val() },
  }).then(function (data) {
    console.log(data.note);
  });
});

// Get any articles from database upon page load
getArticles();
