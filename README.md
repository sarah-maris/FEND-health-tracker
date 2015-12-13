##Front End Nanodegree Project 5-2: Health Tracker
###Food Planner
*This project uses the Backbone.js framework, Firebase storage, the Nutritionix API to track calories consumed and The New York Times API to provide Health News*

See live here: http://sarah-maris.github.io/FEND-health-tracker/

The purpose of this app to to  record daily calorie consumption.  The app defaults to the current date but the user can choose another date using the datepicker.

To log a food item the user first searches for it the item in the Nutritionix database.  If no results are found or if the Nutritionix database is unavailable the user can input the food item manually.

After choosing from a list of results or entering a food description and calorie count manually, the user can enter the number of servings eaten or and the total calories consumed is calculated.  The app keeps a running total of all calories consumed for each date.

The app also provides Health News from The New York Times.

Resources used:
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)
* [Firebase](https://www.firebase.com/)
* [jQueryUI datepicker](http://api.jqueryui.com/datepicker/)
* [Moment.js (date formatting)](http://momentjs.com/)
* [Nutritionix API (calorie count for tracked foods)](http://www.nutritionix.com/api)
* [The New York Times API (snippets and links to health news)](http://developer.nytimes.com/)