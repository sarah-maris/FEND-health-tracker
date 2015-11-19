

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.trackerApp',

    // Template for the calorie count at the bottom of the table
    dateTemplate: _.template( $('#date-template').html() ),
    statsTemplate: _.template( $('#stats-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createOnEnter',
      'keypress .date': 'changeDate',
    },

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {
      this.$date = this.$('.date');
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

    render: function () {
      var dailyCalories = app.foodList.dailyCalories();

      this.$main.show();
      this.$footer.show();

      this.$date.html(this.dateTemplate({
        date: this.$date
      }));

      this.$footer.html(this.statsTemplate({
        dailyCalories: dailyCalories
      }));

      this.$('.filters li a')
        .removeClass('selected')
        .filter('[href="#/' + (app.FoodFilter || '') + '"]')
        .addClass('selected');

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
        dateEaten: this.$date.val()
      };
    },

    // If you hit return in the main input field, create new Food model,
    createOnEnter: function(e) {

      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

      app.foodList.create(this.newAttributes());

      this.$input.val('');
    },

     changeDate: function(e) {

      if (e.which !== ENTER_KEY || !this.$date.val().trim()) {
        return;
      }

console.log(this.$date.val().trim());
    }





  });
