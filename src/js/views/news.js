var app = app || {};

/**  FUNCTION TO RETRIEVE AND DISPLAY HEALTH NEWS FROM NY Times **/
app.getNews = function(){

  var self = this;

  //Get location and template to display news items
  this.$newsItems = $('.news-items');
  this.newsTemplate = _.template( $('#news-template').html() );

  //NY Times API query  -- created at http://developer.nytimes.com/io-docs
  var baseURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?';
  var filters = 'fq=news_desk%3A%28%22Health%22%29';
      filters += '+AND+source%3A%28%22The+New+York+Times%22%29&';
  var fields = 'fl=web_url%2Csnippet%2Clead_paragraph%2Cheadline%2Cpub_date';
      fields += '%2Cnews_desk&';
  var key = 'api-key=deff2d25c9042f8202e28185f1249edc:17:59910050';

  var nytAPIquery = baseURL + filters + fields + key;

  $.getJSON(nytAPIquery)
      .done (function(data) {

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