

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.tracker-app',

    // Template for the calorie count at the bottom of the table
    dailyCalsTemplate: _.template( $('#daily-cals-template').html() ),

    // Set event for creating new food
    events: {
      'keyup #food-search': 'searchFood',
      'keyup #num-servings': 'updateCals',
      'keyup #serving-cals': 'updateCals',
      'click #add-food': 'addFood'
    },

    //Get data from collection
    foodList: app.foodList,

    self: this,
    //
    initialize: function () {

      //Set up variables for easy reference to DOM
      this.$input = this.$('#food-search');
      this.$tableEnd = this.$('.table-end');
      this.$list = $('.food-list');
      this.$results = $('.results-list');

      //When food item is added to collection render on page
      this.listenTo(this.foodList, 'add', this.showFood);

      //At intitilization and when anything in the foodList changes run the filter and render the food list
      this.listenTo(this.foodList, 'all', this.render);

      //Get date from datePicker
      this.appDate = datePicker.appDate;

    },

    //Function to add food item and servings
    showDetails: function(food) {

      //Open table with food information
      $('.food-table').removeClass('hidden');

      //Calculate total calories
      var totCals = food.cals * $('#num-servings').val();

      //Show food information in form
      $('#food-search').val(food.name);
      $('.serving-calories').html(food.cals);
      $('.food-calories').html(totCals.toFixed());

    },

    //Function to update total calories
    updateCals: function(){

      //Calories per serving from database or manual input
      var servingCals = $('.serving-calories').text() || $('#serving-cals').val();

      //Number of servings from input box
      var numServings = $('#num-servings').val();

      //Calculate total calories and show in DOM
      var totCals = servingCals * numServings;
      $('.food-calories').html(totCals.toFixed());

    },

    //Create a new food item when hit enter in input field
    addFood: function(e) {

      //Create a few food item wtih the given attributes
      this.foodList.create(this.searchAttributes());


      this.$input.val('');

      //Close food results table and add back default value for search box
      $('.food-table').addClass('hidden');
      $('.results-list').addClass('hidden');

      //Reset default values for search box and number of servings
      $('#food-search').attr('placeholder', 'What did you eat?').val("");
      $('#num-servings').val(1);
    },

    // Generate the attributes for a new food item.
    searchAttributes: function () {
      return {

        //Get title from chosen food item
        title: $('#food-search').val(),

        //Get calories from the total calories calculation -- use parsInt to convert to number
        calories: parseInt( $('.food-calories').text()),

        //Calculate item order in collection
        order: app.foodList.nextOrder(),

        //Date is chosen date
        dateEaten: this.appDate

      };
    },

    // Generate the attributes for a new food item.
    newAttributes: function () {
      return {

        //Get title from input field
        title: this.$input.val().trim(),

        //Calculate item order in collection
        order: app.foodList.nextOrder(),

        //Date is chosen date
        dateEaten: this.appDate
      };
    },

    //Show food item in list
    showFood: function (food) {

      //Create new FoodView from data
      var view = new app.FoodView({ model: food });

      //Append the new food to the list on the page
      this.$list.append(view.render().el);

    },

    //Calculate total calories for a collection of food items
    dailyCalories: function(foodList){

      return foodList.reduce(function(memo, value) {
        return memo + value.get("calories");
       }, 0);

    },

    render: function(foodList){

      //Filter collection to pull out food items for current date
      filteredList = this.foodList.byDate(this.appDate);

      //Empty the food list
      this.$list.html('');

      //Repopulate the food list
      filteredList.each(function(food){
        appView.showFood(food);
      });

      //Show daily calories at bottom of table
      this.$tableEnd.html(this.dailyCalsTemplate({
        dailyCalories: this.dailyCalories(filteredList)
      }));

      return this;

    },

    searchFood: function() {

      var search =  this.$input.val();

      var self= this;

      var params = {
        'results': '0:20', //Get up to 20 items
        'fields' : 'item_name,brand_name,nf_calories', //Get item, brand and calories
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
      //Log Error
        console.log(err);
      });
    },

    enterManually: function() {

      //Open table with food informatoin
      $('.food-table').removeClass('hidden');

      //Add input box for calories per serving
      $('.serving-calories').html('<input name="serving-calories" id="serving-cals" class="food-info" type="text" value="">');

    },


    showOptions: function( searchResults) {

      //Go through each item in the food
      for (var i=0; i<searchResults.length; i++){

        //Get food item object
        var foodName = searchResults[i].fields.brand_name + ' ' + searchResults[i].fields.item_name;
        var foodCals = searchResults[i].fields.nf_calories.toFixed();
        var serveSize = searchResults[i].fields.nf_serving_size_qty;
        var serveUnit = searchResults[i].fields.nf_serving_size_unit;

        //Get item attributees and display in '.search-results'
        var foodOption = '<li class ="food-option" id="option' + i +'">'; //Open li
        foodOption += foodName + ' ' ; //Add  name
        foodOption += foodCals ; //Add item name
        foodOption += '</li>'; //Close li
        this.$results.append(foodOption); //Add to div

        //Use anonymous function to attach event listeners to search results
        (function () {

          //Create object to pass to add function
          var food = {};
          food.name = foodName;
          food.cals = foodCals; //round calories to avoid decimals
          food.serveSize = serveSize;
          food.serveUnit = serveUnit;

          //On click send data to add function
          $('#option' + i).click( function(){
            appView.showDetails(food);
          });

        }());

      }

    }


  });
