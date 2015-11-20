  // js/app.js

  var app = app || {};
  var ENTER_KEY = 13;

  $(function() {

    // Kick things off by creating the **App**.
    new app.AppView();

var today = new Date();
var date = ("0" + (today.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + today.getDate().toString()).substr(-2)  + "/" + (today.getFullYear().toString()).substr(2);
console.log(today);
console.log(date);

  $( "#datepicker" ).datepicker({
	showOn: "both",
    buttonImage: "assets/images/calendar.png",
    buttonImageOnly: true,
    buttonText: "Select date"
    });

  $( "#datepicker" ).datepicker( "setDate", today );

  });



//TODO: figure out how to make a separate collection for each day
//TODO: get Nutrinix API search working
//TODO: request development plan for recipe API
//TODO: refine colors