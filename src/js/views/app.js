

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.tracker-app',

    // Template for the calorie count at the bottom of the table
    dailyCalsTemplate: _.template( $('#daily-cals-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createFood',
    },

    //Get data from collection
    foodList: app.foodList,

    //
    initialize: function () {

      //Set up variables for easy reference to DOM
      this.$input = this.$('.new-food');
      this.$tableEnd = this.$('.table-end');
      this.$list = $('.food-list');

      //When food item is added to collection render on page
      this.listenTo(this.foodList, 'add', this.showFood);

      //At intitilization and when anything in the foodList changes run the filter and render the food list
      this.listenTo(this.foodList, 'all', this.render);

      //Get date from datePicker
      this.appDate = datePicker.appDate;

    },

    //Create a new food item when hit enter in input field
    createFood: function(e) {

      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

      this.foodList.create(this.newAttributes());

      this.$input.val('');
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
      var view = new app.FoodView({ model: food });
        this.$list.append(view.render().el);
    },

    //Calculate total calories for a collection of food items
    dailyCalories: function(foodList){
      return foodList.reduce(function(memo, value) {
        return memo + value.get("calories");
       }, 0);
    },

    render: function(foodList){

      //Set up self to give access to addFood
      self = this;

      //Filter collection to pull out food items for current date
      filteredList = this.foodList.byDate(this.appDate);

      //Empty the food list
      this.$list.html('');

      //Repopulate the food list
      filteredList.each(function(food){
        self.showFood(food);
      });

      //Show daily calories at bottom of table
      this.$tableEnd.html(this.dailyCalsTemplate({
        dailyCalories: this.dailyCalories(filteredList)
      }));

      return this;

    },

    foodSearch: function(search) {

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
        console.log("here is the data", data);
      })
      .fail(function(err){
      //Log Error
        console.log(err);
      });
  }

  });
