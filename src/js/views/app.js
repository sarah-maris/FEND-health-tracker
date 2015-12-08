

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.tracker-app',

    // Templates for the calorie count at the bottom of the table and search results
    dailyCalsTemplate: _.template( $('#daily-cals-template').html() ),
    resultsTemplate: _.template( $('#results-template').html() ),
    dateTemplate: _.template( $('#date-template').html() ),

    // Set event for creating new food
    events: {
      'keyup #food-search': 'searchFood',
      'keyup #num-servings': 'updateCals',
      'keyup #serving-cals': 'updateCals',
      'click #add-food': 'addFood'
    },

    //Get data from collection
   // foodList: app.foodList,

    //
    initialize: function () {

      //Set up variables for easy reference to DOM
      this.$datePicker = $('.date-picker');
      this.$input = $('#food-search');
      this.$tableEnd = $('.table-end');
      this.$list = $('.food-list');
      this.$results = $('.results-list');
      this.$foodTable = $('.food-table');
      this.$numServings = $('#num-servings');
      this.$serveSize = $('#serving-size');
      this.$serveCals = $('#serving-calories');
      this.$eatenCals = $('#calories-eaten');
      this.$trackerHead = $('.list-head');

      //Set current date as default for app
      this.appDate = this.prettyDate(new Date());

      //Add date to firebase url to create a new collection for each date
      this.dateUrl = 'https://food-tracker-sam.firebaseio.com/' + this.appDate.replace(/\//g, '');

      //Initialize date picker
      this.renderDate();

      //Set intial date to today
      this.$("#datepicker").datepicker( "setDate", this.appDate );

      //Fire the collection to get the foodlist from Firebase
      this.foodList = new FoodList({
        url: this.dateUrl
      });

      //When food item is added to collection render on page
      this.listenTo(this.foodList, 'add', this.showFood);

      //At intitilization and when anything in the foodList changes run the filter and render the food list
      this.listenTo(this.foodList, 'all', this.render);

    },

    //Format intial date to match mm/dd/yyyy format
    prettyDate: function(date) {
      return ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2)  + "/" + (date.getFullYear().toString());
    },

    //Function to add food item and servings
    showDetails: function(food) {

      //Open table with food information
      this.$foodTable.removeClass('hidden');

      //Calculate total calories
      var totCals = food.cals * this.$numServings.val();

      //Show food information in form
      this.$input.val(food.name);
      this.$serveSize.html(food.serveSize + ' ' + food.serveUnit);
      this.$serveCals.html(food.cals);
      this.$eatenCals.html(totCals.toFixed());

    },

    //Function to update total calories
    updateCals: function(){

      //Calories per serving from database or manual input
      var servingCals = this.$serveCals.text() || this.$inputCals.val();

      //Number of servings from input box
      var numServings = this.$numServings.val();

      //Calculate total calories and show in DOM
      var totCals = servingCals * numServings;
      this.$eatenCals.html(totCals.toFixed());

    },

    //Create a new food item when hit enter in input field
    addFood: function(e) {

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
    },

    // Generate the attributes for a new food item.
    foodAttributes: function () {
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

    //Show food item in list
    showFood: function (food) {

      //Create new FoodView from data
      var view = new app.FoodView({ model: food });

      //Append the new food to the list on the page
      this.$list.prepend(view.render().el);

    },

    //Calculate total calories for a collection of food items
    dailyCalories: function(foodList){

      return foodList.reduce(function(memo, value) {
        return memo + value.get("calories");
       }, 0);

    },

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

    render: function(){

      var self = this;
//TODO remove filters when date url is working
      //Filter collection to pull out food items for current date
      filteredList = this.foodList.byDate(this.appDate);

      //If no food eaten hide table header
      if (filteredList._wrapped.length < 1){
        this.$trackerHead.addClass('hidden');
      } else {
        this.$trackerHead.removeClass('hidden');
      }

      //Empty the food list
      this.$list.html('');

      //Repopulate the food list
      filteredList.each(function(food){
        self.showFood(food);
      });

      //Show daily calories at bottom of table
      this.$list.append(this.dailyCalsTemplate({
        dailyCalories: this.dailyCalories(filteredList)
      }));

      return this;

    },

    searchFood: function() {

      var search =  this.$input.val();

      var self= this;

      var params = {
//TODO: Increase results to 20 when done with dev
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
          self.showOptions(data.hits);

        //If no results enter food manually
        } else {
          self.enterManually();
        }

      })
      .fail(function(err){

        //On fail enter food manually and log error
        self.enterManually();
        console.log(err);
      });
    },

    enterManually: function() {

      //Open table with food informatoin
      this.$foodTable.removeClass('hidden');

      //Show "no results found" message
      this.$results.prepend('<h4 class="no-results">NO RESULTS FOUND.<br>PLEASE ENTER FOOD ITEM MANUALLY</h4>');

      //Add input box for servine size and calories per serving
      this.$serveSize.html('<input name="serving-size" id="serving-size" class="food-input size-input" type="text" value="">');
      this.$serveCals.html('<input name="serving-calories" id="serving-cals" class="food-input" type="text" value="">');

      //Set variable for calories input
      this.$inputCals = $('#serving-cals');

    },

    //Display search results
    showOptions: function( searchResults) {

    var self = this;

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

          //On click send data to add function
          $('#option' + i).click( function(){
            self.showDetails(searchFood);
          });

        }());

      }

    },

   //Change appDate and re-render foodlist view when date is changed
    updateView: function(dateText) {
      this.appDate =  dateText;
      this.render();
    }

  });

