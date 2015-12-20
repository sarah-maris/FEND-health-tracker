var app = app || {};
var ENTER_KEY = 13;

$(function() {

//Start the app by initiating the appview
app.appView =  new app.AppView();

//Get the Health news
app.getNews();

});
