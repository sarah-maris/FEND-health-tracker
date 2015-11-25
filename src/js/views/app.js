

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.trackerApp',


    // Template for the calorie count at the bottom of the table
    statsTemplate: _.template( $('#stats-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createOnEnter'
    },

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {


      this.$input = this.$('.new-food');
      this.$tableEnd = this.$('.table-end');
      this.$main = this.$('.main');
      this.$list = $('.food-list');

      this.listenTo(app.foodList, 'add', this.addFood);
      this.listenTo(app.foodList, 'filter', this.filterAll);
      this.listenTo(app.foodList, 'all', this.render);

      //Get date from datePicker
       this.appDate = datePicker.appDate;

    },

    render: function () {

      //Get calories consumed and put in bottom of table
      this.$tableEnd.html(this.statsTemplate({
        dailyCalories: app.foodList.dailyCalories()
      }));



    },

    // Add a single food item to the list by creating a view for it, and
    addFood: function (food) {
      var view = new app.FoodView({ model: food });
      this.$list.append(view.render().el);
    },

    // Generate the attributes for a new food item.
    newAttributes: function () {
      return {
        title: this.$input.val().trim(),
        order: app.foodList.nextOrder(),
        dateEaten: this.appDate
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
