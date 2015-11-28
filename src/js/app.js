  // js/app.js

  var app = app || {};
  var ENTER_KEY = 13;

  $(function() {

    //intialize datePicker
    datePicker = new app.DatePicker();

    //Start the app by initiating the appview*.
    appView = new app.AppView();

  });

//TODO: figure out how to link datepicker to collection (filter and add up calories)
//TODO: get Nutrinix API search working
//TODO: request development plan for recipe API
//TODO: get health and nutrition articles from NY Times
