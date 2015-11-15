

 var app = app || {};

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '.trackerApp',

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template( $('#stats-template').html() ),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      'keypress .new-food': 'createOnEnter',
      'click .clear-completed': 'clearCompleted',
      'click .toggle-all': 'toggleAllComplete'
    },

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {
      this.allCheckbox = this.$('.toggle-all')[0];
      this.$input = this.$('.new-food');
      this.$footer = this.$('.footer');
      this.$main = this.$('.main');
      this.$list = $('.food-list');

      this.listenTo(app.foodList, 'add', this.addOne);
      this.listenTo(app.foodList, 'reset', this.addAll);

      this.listenTo(app.foodList, 'change:completed', this.filterOne);
      this.listenTo(app.foodList, 'filter', this.filterAll);
      this.listenTo(app.foodList, 'all', this.render);

      app.foodList.fetch();

    },

  // New
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function () {
      var completed = app.foodList.completed().length;
      var remaining = app.foodList.remaining().length;

      if (app.foodList.length) {
        this.$main.show();
        this.$footer.show();

        this.$footer.html(this.statsTemplate({
          completed: completed,
          remaining: remaining
        }));

        this.$('.filters li a')
          .removeClass('selected')
          .filter('[href="#/' + (app.FoodFilter || '') + '"]')
          .addClass('selected');
      } else {
        this.$main.hide();
        this.$footer.hide();
      }

      this.allCheckbox.checked = !remaining;
    },

    // Add a single food item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
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
        completed: false
      };
    },

    // If you hit return in the main input field, create new Food model,
    // persisting it to localStorage.
    createOnEnter: function(e) {

      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

     app.foodList.create(this.newAttributes());

      this.$input.val('');
    },

    // Clear all completed food items, destroying their models.
    clearCompleted: function () {
      _.invoke(app.foodList.completed(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var completed = this.allCheckbox.checked;

      app.foodList.each(function (food) {
        food.save({
          completed: completed
        });
      });
    }



  });
