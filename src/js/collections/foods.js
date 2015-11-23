  var app = app || {};

  var FoodList = Backbone.Firebase.Collection.extend({

    // Reference to this collection's model.
    model: app.Food,

    // Save all of the food items to Firebase.
    url: "https://food-tracker-sam.firebaseio.com",

    // We keep the food eaten in sequential order. This generates the next order number for new items.
    nextOrder: function() {
      if ( !this.length ) {
        return 1;
      }
      return this.last().get('order') + 1;
    },

    // Food items are sorted by their original insertion order.
    comparator: function( food ) {
      return food.get('order');
    },

    dailyCalories: function(){
      return this.reduce(function(memo, value) {
        return memo + value.get("calories");
       }, 0);
    },

  });

  // Create our global food list.
  app.foodList = new FoodList();