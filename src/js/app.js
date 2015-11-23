  // js/app.js

  var app = app || {};
  var ENTER_KEY = 13;

  $(function() {

    //Start the app by initiating the appview*.
    appView = new app.AppView();

window.Events = {};
_.extend(window.Events, Backbone.Events);
  });

//TODO: figure out how to make a separate collection for each day
//TODO: get Nutrinix API search working
//TODO: request development plan for recipe API
