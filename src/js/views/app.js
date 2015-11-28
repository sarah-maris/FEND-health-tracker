

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.trackerApp',


    // Template for the calorie count at the bottom of the table
    statsTemplate: _.template( $('#stats-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createOnEnter'
    },


    foodList: new FoodList(),

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {


      this.$input = this.$('.new-food');
      this.$tableEnd = this.$('.table-end');
      this.$main = this.$('.main');
      this.$list = $('.food-list');

      //Add new food to main collection
      this.listenTo(app.foodList, 'add', this.addFood);

      //Render filtered collection
      this.listenTo(this.foodList, 'all', this.render);

      //Get date from datePicker
      this.appDate = datePicker.appDate;

    },

    render: function () {

      //Get calories consumed and put in bottom of table
      this.$tableEnd.html(this.statsTemplate({
        dailyCalories: this.foodList.dailyCalories()
      }));

      this.foodList.forEach(this.addFood, this);

    },

    // Show food if matches date
    addFood: function (food) {
      var view = new app.FoodView({ model: food });
      var foodDate = view.model.attributes.dateEaten;
      if (foodDate == this.appDate) {
              this.$list.append(view.render().el);
     }

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
