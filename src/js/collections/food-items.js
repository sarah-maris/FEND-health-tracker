var app = app || {};

var FoodList = Backbone.Firebase.Collection.extend({

  // Get the model
  model: app.Food,

  //Set url based on aooDate (passed from AppView)
  initialize: function(models, params) {
      this.url = params.url;
  },

  // Add order attribute to keep track of order that items are added
  nextOrder: function() {
    if (!this.length) {
      return 1;
    }
    return this.last().get('order') + 1;
  },

  //Sort food items by the order they were added
  comparator: function(food) {
    return food.get('order');
  }

});