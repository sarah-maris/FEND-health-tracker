var app = app || {};

/**  FUNCTION TO RETRIEVE AND DISPLAY HEALTH NEWS FROM NY Times **/
app.getNews = function(){

  var self = this;

  //Get location and template to display news items
  this.$newsItems = $('.news-items');
  this.newsTemplate = _.template( $('#news-template').html() );

  //NY Times API query  -- created at http://developer.nytimes.com/io-docs
  var baseUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
  baseUrl += '?' + $.param({
    'api-key': "f575d0bca4674b2ebaada99ac588d129",
    'fq': "news_desk:(\"Health & Fitness\") AND source:(\"The New York Times\")",
    'sort': "newest"
  });

  $.ajax({
    url: baseUrl,
    method: 'GET',
  }).done (function(data) {

       //Iterate through articles and attach to #nytimes-articles
        var articles = data.response.docs;
        var headline, newsURL, paragraph, pubDate;
        var numArticles = 6;

        //Show number of articles set above
        for (var i = 0; i < numArticles; i ++) {

          //Show results using template
          self.$newsItems.append(self.newsTemplate({
            headline:  articles[i].headline.main,

             //use snippet if lead_paragraph is empty
            paragraph: articles[i].lead_paragraph || articles[i].snippet,
            newsURL: articles[i].web_url,

            //use moment.js function to format date
            pubDate: moment(articles[i].pub_date).format('MMMM DD, YYYY')
          }));

        }
        })
      .fail(function(err){

         //change news feed header to show error
         self.$newsItems.text('New York Times Articles could not be loaded');
         console.log("Bad AJAX request", err);
      });

};