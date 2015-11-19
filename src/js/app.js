  // js/app.js

  var app = app || {};
  var ENTER_KEY = 13;

  $(function() {

    // Kick things off by creating the **App**.
    new app.AppView();


  $( "#datepicker" ).datepicker({
     showOn: "button",
    buttonImage: "assets/images/calendar.png",
    buttonImageOnly: true,
    buttonText: "Select date"
    });


  });

//TODO: figure out how to make a separate collection for each day
//TODO: get Nutrinix API search working
//TODO: request development plan for recipe API
//TODO: refine colors