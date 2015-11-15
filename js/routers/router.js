  var app = app || {};

  var Workspace = Backbone.Router.extend({
    routes:{
      '*filter': 'setFilter'
    },

    setFilter: function( param ) {
      // Set the current filter to be used
      if (param) {
        param = param.trim();
      }
      app.FoodFilter = param || '';

      // Trigger a collection filter event, causing hiding/unhiding fooditems
      app.foodList.trigger('filter');
    }
  });

  app.FoodRouter = new Workspace();
  Backbone.history.start();
