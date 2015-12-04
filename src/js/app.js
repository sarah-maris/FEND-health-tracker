  // js/app.js

  var app = app || {};
  var ENTER_KEY = 13;

  $(function() {

    //intialize datePicker
    datePicker = new app.DatePicker();

    //Start the app by initiating the appview*.
    appView = new app.AppView();

  });

//TODO: get health and nutrition articles from NY Times
//TODO: style list better