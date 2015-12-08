  var app = app || {};

  //Basic model for FoodTracker
  app.Food = Backbone.Model.extend({

    // Set default attributes
    defaults: {
      name: '',
      calories: 100,
      dateEaten: '',
      servings: 0,
      serveSize: '',
      order: 0
    },

  });

