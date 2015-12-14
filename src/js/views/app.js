var app = app || {};

app.AppView = Backbone.View.extend({

  /**  BASC BACKBONE.JS FUNCTIONS  **/
  el: '.tracker-app',

  // Templates for the calorie count at the bottom of the table and search results
  dailyCalsTemplate: _.template( $('#daily-cals-template').html() ),
  resultsTemplate: _.template( $('#results-template').html() ),
  dateTemplate: _.template( $('#date-template').html() ),
  newsTemplate: _.template( $('#news-template').html() ),

  // Set events for searching and creating new food
  events: {
    'keyup #food-search': 'searchFood',
    'keyup #num-servings': 'updateCals',
    'keyup #serving-cals': 'updateCals',
    'click #add-food': 'addFood',
    'click #enter-manual': 'enterManually'
  },

  initialize: function () {

    //Set up variables for easy reference to DOM
    this.$datePicker = $('.date-picker');
    this.$input = $('#food-search');
    this.$manualOption = $('.manual-option');
    this.$tableEnd = $('.table-end');
    this.$list = $('.food-list');
    this.$results = $('.results-list');
    this.$foodTable = $('.food-table');
    this.$numServings = $('#num-servings');
    this.$serveSize = $('#serving-size');
    this.$serveCals = $('#serving-calories');
    this.$eatenCals = $('#calories-eaten');
    this.$trackerHead = $('.list-head');
    this.$trackerApp = $('.tracker-app');
    this.$newsItems = $('.news-items');

    //Set current date as default for app -- use moment.js to format
    this.appDate = moment(new Date()).format('MM/DD/YYYY');

    //Initialize date picker
    this.renderDate();

    //Set intial date to today
    this.$("#datepicker").datepicker( "setDate", this.appDate );

    //Render view
    this.render();

    //Show NY Times Health News items
    this.getNews();

    //At intitilization and when anything in the foodList changes run the filter and render the food list
    this.listenTo(this.foodList, 'all', this.render);

  },

  updateFoodList: function(){
console.log("in updateFoodList")
    //Add date to firebase url to create a new collection for each date
    this.dateUrl = 'https://food-tracker-sam.firebaseio.com/' + this.appDate.replace(/\//g, '');

    //Fire a FoodList collection to get data from Firebase
    this.foodList = new FoodList([], {
      url: this.dateUrl
    });

    //At intitilization and when anything in the foodList changes run the filter and render the food list
    this.listenTo(this.foodList, 'add', this.render);
    this.listenTo(this.foodList, 'remove', this.render);

  },

  render: function(){
console.log("in render")
    var self = this;

    this.updateFoodList();

    //If no food eaten hide table header
    if (this.foodList.length < 1){
      this.$trackerHead.addClass('hidden');
    } else {
      this.$trackerHead.removeClass('hidden');
    }

    //Empty the food list
    this.$list.html('');

    //Repopulate the food list
    this.foodList.each(function(food){
      self.showFood(food);
    });

    //Show daily calories at bottom of table
    this.showDailyCalories();

    return this;

  },

  /**  DATE FUNCTIONS  **/

  renderDate: function(foodList){

    var self = this;

    //Render date picker using template in index.html
    this.$datePicker.html(this.dateTemplate());

    //Set attributes for datepicker
    this.$("#datepicker").datepicker({
      showOn: "both",
      buttonImage: "assets/images/calendar.png",
      buttonImageOnly: true,
      buttonText: "Select date",

      //When a new date is selected, update view
      onSelect: function(dateText, e) {
        self.updateView(dateText);
      }

    });
  },

 //Change appDate and re-render foodlist view when date is changed
  updateView: function(dateText) {
  console.log("in updateView")
    this.appDate =  dateText;
    this.render();
  },

  /**  SEARCH FUNCTIONS  **/

  //Search Nutritionix database using AJAX query
  searchFood: function() {
  console.log("in searchFood")
    var search =  this.$input.val();

    var self= this;

    var params = {
//TODO: Increase results to 20 when done with dev ****** FIX BEFORE DEPLOYMENT ******
      'results': '0:5', //Get up to 20 items
      'fields' : 'item_name,brand_name,nf_calories,nf_serving_size_qty,nf_serving_size_unit', //Get item, brand and calories
      'appId': '72e7d3f2',
      'appKey': 'be0b61430f161b795ac29ebebfada85a'
    };

    $.ajax({
      type: 'GET',
      url: 'https://api.nutritionix.com/v1_1/search/' + search,
      dataType: 'json',
      data: params,
    })
    .done(function( data ){

      //Empty searcg results list and remove 'hidden class'
      self.$results.html("");
      self.$results.removeClass('hidden');

      //If have results, show the options
      if (data.hits.length > 0) {
        self.showResults(data.hits);

      //If no results enter food manually
      } else {
        //Show "no results found" message and show manual entry form
        self.$results.prepend('<h4 class="no-results">NO RESULTS FOUND.<br>PLEASE ENTER FOOD ITEM MANUALLY</h4>');
        self.enterManually();
      }

    })
    .fail(function(err){

      //On fail enter food manually and log error
      self.enterManually();
      console.log(err);
    });
  },

  //Display search results
  showResults: function( searchResults) {

  var self = this;

    //Show button to add item manually
    this.$manualOption.removeClass('hidden');

    //Go through each item in the food
    for (var i=0; i<searchResults.length; i++){

      //Set up variables
      var searchFields = searchResults[i].fields;
      var id = i;

      //Create object to pass to add function
      var food = {};
      food.name = searchResults[i].fields.brand_name + ' ' + searchResults[i].fields.item_name;
      food.cals = searchResults[i].fields.nf_calories.toFixed(); //round calories to avoid decimals
      food.serveSize = searchResults[i].fields.nf_serving_size_qty;
      food.serveUnit = searchResults[i].fields.nf_serving_size_unit;

      //Show results using template
      this.$results.append(this.resultsTemplate({
        name: food.name,
        calories: food.cals,
        id: id,
        serveUnit: food.serveUnit,
        serveSize: food.serveSize
      }));

      //Use anonymous function to attach event listeners to search results
      (function () {

        //Use variable to capture food object for this item
        var searchFood = food;

        //On click send data to add function and hide manual option button
        $('#option' + i).click( function(){
          self.showDetails(searchFood);
          self.$manualOption.addClass('hidden');
        });

      }());

    }

 },

  //Enter a food item manually if Nutritionix is down or returns no results
  enterManually: function() {

    //Open table with food information and hide the "Enter manually" button
    this.$foodTable.removeClass('hidden');
    this.$manualOption.addClass('hidden');

    //Add input box for servine size and calories per serving
    this.$serveSize.html('<input name="serving-size" id="serving-size" class="food-input size-input" type="text" value="">');
    this.$serveCals.html('<input name="serving-calories" id="serving-cals" class="food-input" type="text" value="">');

    //Set variable for calories input
    this.$inputCals = $('#serving-cals');

  },


  /**  NEW FOOD ITEM ENTRY FUNCTIONS  **/

  //Show details about a food item
  showDetails: function(food) {

    //Open table with food information
    this.$foodTable.removeClass('hidden');

    //Calculate total calories
    var totCals = food.cals * this.$numServings.val();

    //Show food information in app
    this.$input.val(food.name);
    this.$serveSize.html(food.serveSize + ' ' + food.serveUnit);
    this.$serveCals.html(food.cals);
    this.$eatenCals.html(totCals.toFixed());

  },

  //Update total calories for a food item based on servings and calories per serving
  updateCals: function(){
console.log("in updateCals")
    //Calories per serving from database or manual input
    var servingCals = this.$serveCals.text() || this.$inputCals.val();

    //Number of servings from input box
    var numServings = this.$numServings.val();

    //Calculate total calories and show in app
    var totCals = servingCals * numServings;
    this.$eatenCals.html(totCals.toFixed());

  },

  // Generate the attributes for a new food item.
  foodAttributes: function () {

 console.log("infoodAttribute")
    return {

      //Get name of chosen food item
      name: this.$input.val(),

      //Get calories from the total calories calculation -- use parsInt to convert to number
      calories: parseInt(this.$eatenCals.text()),

      //Date is chosen date
      dateEaten: this.appDate,

      //Get serving size and number of servings from DOM
      serveSize: this.$serveSize.text(),
      servings: this.$numServings.val(),

      //Calculate item order in collection
      order: this.foodList.nextOrder()

    };
  },

  //Add a new food item to the databaseeld
  addFood: function(e) {
 console.log("In addFood")

    //Create a few food item wtih the given attributes
    this.foodList.create(this.foodAttributes());

    this.$input.val('');

    //Close food results table and add back default value for search box
    this.$foodTable.addClass('hidden');
    this.$results.addClass('hidden');

    //Reset default values for search box and number of servings
    this.$input.attr('placeholder', 'What did you eat?').val('');
    this.$numServings.val(1);
    this.$eatenCals.html('');

    this.render();
  },

  /**  FOOD LOG DISPLAY FUNCTIONS  **/

  //Show food item in list
  showFood: function (food) {
console.log("in showFood")

    //Create new FoodView from data
    var view = new app.FoodView({ model: food });

    //Append the new food to the list on the page
    this.$list.prepend(view.render().el);

  },

  showDailyCalories: function(){

    var self = this;

    this.$list.append(this.dailyCalsTemplate({
      dailyCalories: this.dailyCalories(self.foodList)
    }));
  },

  //Calculate total calories for a collection of food items
  dailyCalories: function(foodList){

    return foodList.reduce(function(memo, value) {
      return memo + value.get("calories");
     }, 0);

  },

  /**  FUNCTION TO RETRIEVE AND DISPLAY HEALTH NEWS FROM NY Times **/
  getNews: function(){

    var self = this;

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
            self.$newsItems.append(self.newsTemplate({
              headline:  articles[i].headline.main,

               //use snippet if lead_paragraph is empty
              paragraph: articles[i].lead_paragraph || articles[i].snippet,
              newsURL: articles[i].web_url,

              //use moment.js function to format date
              pubDate: moment(articles[i].pub_date).format("MMMM DD, YYYY")
            }));

          }
          })
        .fail(function(e){
           //change news feed header to show error
           this.$nytHeaderElem.text("New York Times Articles could not be loaded");
           console.log("Bad AJAX request", e);
        });

  }

});

//TDDO: Fix responsive