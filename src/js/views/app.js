

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.trackerApp',

    // Template for the calorie count at the bottom of the table
    statsTemplate: _.template( $('#stats-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createOnEnter',
    },

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {
      this.$input = this.$('.new-food');
      this.$footer = this.$('.footer');
      this.$main = this.$('.main');
      this.$list = $('.food-list');

      this.listenTo(app.foodList, 'add', this.addOne);
      this.listenTo(app.foodList, 'reset', this.addAll);

      this.listenTo(app.foodList, 'filter', this.filterAll);
      this.listenTo(app.foodList, 'all', this.render);

      app.foodList.fetch();

    },

  // New
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function () {
      var dailyCalories = app.foodList.dailyCalories();

      if (app.foodList.length) {
        this.$main.show();
        this.$footer.show();

        this.$footer.html(this.statsTemplate({
          dailyCalories: dailyCalories


        }));

        this.$('.filters li a')
          .removeClass('selected')
          .filter('[href="#/' + (app.FoodFilter || '') + '"]')
          .addClass('selected');
      } else {
        this.$main.hide();
        this.$footer.hide();
      }

    },

    // Add a single food item to the list by creating a view for it, and
    addOne: function (food) {
      var view = new app.FoodView({ model: food });
      this.$list.append(view.render().el);
    },

    // Add all items in the FoodList collection at once.
    addAll: function () {
      this.$list.html('');
      app.foodList.each(this.addOne, this);
    },


    filterOne: function (food) {
      food.trigger('visible');
    },

    filterAll: function () {
      app.foodList.each(this.filterOne, this);
    },


    // Generate the attributes for a new food item.
    newAttributes: function () {
      return {
        title: this.$input.val().trim(),
        order: app.foodList.nextOrder(),
      };
    },

    // If you hit return in the main input field, create new Food model,
    createOnEnter: function(e) {

      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

     app.foodList.create(this.newAttributes());

      this.$input.val('');
    }


  });
