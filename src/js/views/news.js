// Get and display health news from the New York Times

//Set up variables
var $newsItems = $('.news-items');
var newsTemplate =  _.template( $('#news-template').html() );

//NY Times API query  -- created at http://developer.nytimes.com/io-docs
var nytAPIquery ='http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=news_desk%3A%28%22Health%22%29+AND+source%3A%28%22The+New+York+Times%22%29&fl=web_url%2Csnippet%2Clead_paragraph%2Cheadline%2Cpub_date%2Cnews_desk&api-key=deff2d25c9042f8202e28185f1249edc:17:59910050';

$.getJSON( nytAPIquery)
  .done (function( data ) {

   //Iterate through articles and attach to #nytimes-articles
    var articles = data.response.docs;
    var headline, newsURL, paragraph, pubDate;

    //Show only 6 articles
    for (var i = 0; i < 6; i ++) {

      //Show results using template
      $newsItems.append(newsTemplate({
        headline:  articles[i].headline.main,

         //use snippet if lead_paragraph is empty
        paragraph: articles[i].lead_paragraph || articles[i].snippet,
        newsURL: articles[i].web_url,

        //use moment.js function to format date
        pubDate: moment(articles[i].pub_date).format("MMMM DD, YYYY")
      }));

    }
  })
.fail(function(){
   //change news feed header to show error
   $nytHeaderElem.text("New York Times Articles could not be loaded");
   console.log("Bad AJAX request");
});

//TODO: move this into appView
//TDDO: Fix responsive