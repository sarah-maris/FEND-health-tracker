  var app = app || {};

  //Basic model for FoodTracker
  app.Food = Backbone.Model.extend({

    // Set default attributes
    defaults: {
      title: '',
      completed: false,
      calories: 100,
      dateEaten: '',
      order: 0
    },

    // Toggle the `completed` state of this food item.
    toggle: function () {
      this.save({
        completed: !this.get('completed')
      });
    }

  });
