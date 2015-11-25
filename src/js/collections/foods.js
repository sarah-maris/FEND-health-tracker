  var app = app || {};

  var FoodList = Backbone.Firebase.Collection.extend({

    // Get the model
    model: app.Food,

    //Use Firebase for food item storage
    url: "https://food-tracker-sam.firebaseio.com",

    // Add order attribute to keep track of order that items are added
    nextOrder: function() {
      if ( !this.length ) {
        return 1;
      }
      return this.last().get('order') + 1;
    },

    //Sort food items by the order they were added
    comparator: function( food ) {
      return food.get('order');
    },

    //Calculate total calories
    dailyCalories: function(){
      return this.reduce(function(memo, value) {
        return memo + value.get("calories");
       }, 0);
    },

  });

  //Fire the collection to get the foodlist from Firebase
  app.foodList = new FoodList();