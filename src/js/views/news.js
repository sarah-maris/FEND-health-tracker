  var $newsHeader = $('.news-header');




  //get news stories from NY Times

 // fq=news_desk%3A%28%22Health+%26+Fitness%22%29&sort=newest&fl=web_url%2Csnippet%2Cheadline%2Cpub_date%2Cnews_desk
  var nytAPIquery = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=news_desk%3A%28%22Health+%26+Fitness%22%29&sort=newest&fl=web_url%2Csnippet%2Cheadline%2Cpub_date%2Cnews_desk&api-key=deff2d25c9042f8202e28185f1249edc:17:59910050'; //eliminate classifieds
  $.getJSON( nytAPIquery)
    .done (function( data ) {
     //change news feed header
     $newsHeader.text("New York Times Articles about " );

     //Iterate through articles and attach to #nytimes-articles
      var articles = data.response.docs;
      var headline, webURL, paragraph, articleLi;
      for (var i = 0; i < articles.length; i ++) {
        headline =  articles[i].headline.main;
        paragraph =  articles[i].lead_paragraph || articles[i].snippet; //use snippet if lead_paragraph is empty
        webURL = articles[i].web_url;
        //set up list item
        articleLi = '<li class="article"><a href="' + webURL + '"target="_blank"> '+ headline + '</a> <p>' + paragraph + '</p></li>';
        //append to #nytimes-articles
        $(articleLi).appendTo( $newsHeader );
      }
    })
  .fail(function(){
     //change news feed header to show error
     $nytHeaderElem.text("New York Times Articles could not be loaded");
     console.log("Bad AJAX request");
  });
