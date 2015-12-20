var app = app || {};

app.AppView = Backbone.View.extend({

  /**  BASIC BACKBONE.JS FUNCTIONS  **/

  el: '.tracker-app',

  // Templates for the calorie count at the bottom of the table and search results
  dailyCalsTemplate: _.template( $('#daily-cals-template').html() ),
  resultsTemplate: _.template( $('#results-template').html() ),
  dateTemplate: _.template( $('#date-template').html() ),

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

    //Set current date as default for app -- use moment.js to format
    this.appDate = moment(new Date()).format('MM/DD/YYYY');

    //Initialize date picker and set intial date to today
    this.renderDate();
    this.$("#datepicker").datepicker("setDate", this.appDate);

    //Set variable to keep track of whether manual entry message should show
    this.showManual = true;

    //Render view
    this.render();

    //At intitilization and when anything in the foodList changes re-render the food list
    this.listenTo(this.foodList, 'all', this.render);

  },

  updateFoodList: function(){

    //Take slashes out of date
    this.cleanDate = this.appDate.replace(/\//g, '');

    //Add date to firebase url to create a new collection for each date
    this.dateUrl = 'https://food-tracker-sam.firebaseio.com/' + this.cleanDate;

    //Fire a FoodList collection to get data from Firebase
    this.foodList = new FoodList([], {
      url: this.dateUrl
    });

    //At intitilization and when anything in the foodList changes run the filter and render the food list
    this.listenTo(this.foodList, 'add', this.render);
    this.listenTo(this.foodList, 'remove', this.render);

  },

  render: function(){

    var self = this;

    //Get the right foodList for this date
    this.updateFoodList();

    //If no foodList is empty, hide the table header
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

    this.appDate =  dateText;
    this.render();
  },

  /**  SEARCH FUNCTIONS  **/

  //Search Nutritionix database using AJAX query
  searchFood: function() {

    var search = this.$input.val();

    var self= this;

    var params = {

      //Get up to 15 items
      'results': '0:15',

      //Get item, brand and calories
      'fields': 'item_name,brand_name,nf_calories,nf_serving_size_qty,nf_serving_size_unit',
      'appId': '72e7d3f2',
      'appKey': 'be0b61430f161b795ac29ebebfada85a'
    };

    //Show loader gif
    $(".loader").fadeIn();

    $.ajax({
      type: 'GET',
      url: 'https://api.nutritionix.com/v1_1/search/' + search,
      dataType: 'json',
      data: params,
    })

    .done(function(data){

      //fade out loader gif
      $(".loader").fadeOut(1000);

      //Empty searcg results list and remove 'hidden class'
      self.$results.html("");
      self.$results.removeClass('hidden');

      //If have results, show the options
      if (data.hits.length > 0) {
        self.showResults(data.hits);

      //If no results enter food manually
      } else {

        //Show "no results found" message
        var message = '<h4 class="no-results">NO RESULTS FOUND.<br>';
            message += 'PLEASE ENTER FOOD ITEM MANUALLY</h4>';
        self.$results.prepend(message);

        // Open manual entry form
        self.enterManually();
      }

    })

    .fail(function(err){

      //fade out loader gif
      $(".loader").fadeOut(1000);

      //On fail show fail message
      var message = '<h4 class="no-results">NUTRITIONIX REQUEST FAILED<br>';
          message += 'PLEASE ENTER FOOD ITEM MANUALLY</h4>';
      self.$results.html(message);

      // Open manual entry form
      self.enterManually();

    });
  },

  //Display search results
  showResults: function(searchResults) {

  var self = this;

    //Show button to add item manually if it hasn't already been triggered
    if (this.showManual) {
      this.$manualOption.removeClass('hidden');
    }

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

        //On click send data to add function,  hide manual option button and set showManual to false
        $('#option' + i).click( function(){
          self.showDetails(searchFood);
          self.$manualOption.addClass('hidden');
          self.showManual = false;
        });

      }());

    }

 },

  //Enter a food item manually if Nutritionix is down or returns no results
  enterManually: function() {

    //Open table with food information and hide the "Enter manually" button
    this.$foodTable.removeClass('hidden');
    this.$manualOption.addClass('hidden');
    this.showManual = false;

    //Add input box for servine size and calories per serving
    var serveHTML = '<input name="serving-size" id="serving-size-input" ';
        serveHTML += 'class="food-input size-input" type="text" >';
    this.$serveSize.html(serveHTML);

    var serveCals = '<input name="serving-calories" id="serving-cals"';
        serveCals += '< class="food-input" type="text" value="">';
    this.$serveCals.html(serveCals);

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

    var serveSize;

    //If there is a serving size input box, use that for serving size
    if ( $('#serving-size-input') ) {
      serveSize = $('#serving-size-input').val();

    //Otherwise use the info from item chosen in search
    } else {
      serveSize = this.$serveSize.text();
    }

    return {

      //Get name of chosen food item
      name: this.$input.val(),

      //Get calories from the total calories calculation -- use parsInt to convert to number
      calories: parseInt(this.$eatenCals.text()),

      //Date is chosen date
      dateEaten: this.appDate,

      //Get serving size and number of servings from DOM
      serveSize: serveSize,
      servings: this.$numServings.val(),

      //Calculate item order in collection
      order: this.foodList.nextOrder()

    };
  },

  //Add a new food item to the databaseeld
  addFood: function(e) {

    this.foodList.create(this.foodAttributes());

    this.$input.val('');

    //Close food results table and add back default value for search box
    this.$foodTable.addClass('hidden');
    this.$results.addClass('hidden');

    //Reset default values for search box and number of servings
    this.$input.attr('placeholder', 'What did you eat?').val('');
    this.$numServings.val(1);
    this.$eatenCals.html('');

    //Show option for manual entry on next search
    this.showManual = true;

    this.render();
  },

  /**  FOOD LOG DISPLAY FUNCTIONS  **/

  //Show food item in list
  showFood: function (food) {

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

  }

});
