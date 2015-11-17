  var app = app || {};

  //Basic model for FoodTracker
  app.Food = Backbone.Model.extend({

    // Set default attributes
    defaults: {
      title: '',
      calories: 100,
      dateEaten: '',
      order: 0
    },

  });
