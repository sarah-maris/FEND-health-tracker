

 var app = app || {};

  app.AppView = Backbone.View.extend({

    el: '.tracker-app',

    // Template for the calorie count at the bottom of the table
    statsTemplate: _.template( $('#stats-template').html() ),

    // Set event for creating new food
    events: {
      'keypress .new-food': 'createFood',
  //TEMPORARTY FUNCTION TO CALL FILTER BY DATE
      'click .app-header': 'filterByDate'
    },

//Get data from collection
    foodList: app.foodList,

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {


      this.$input = this.$('.new-food');
      this.$tableEnd = this.$('.table-end');
      this.$main = this.$('.main');
      this.$list = $('.food-list');

      //Add new food to main collection
      this.listenTo(this.foodList, 'add', this.addFood);

      //Render filtered collection
      this.listenTo(this.foodList, 'all', this.render);

      //Get date from datePicker
      this.appDate = datePicker.appDate;

      //Filter for the current date
      this.filterByDate();

    },

    render: function () {

      //Get calories consumed and put in bottom of table
      this.$tableEnd.html(this.statsTemplate({
        dailyCalories: this.foodList.dailyCalories()
      }));

    },

    // Show food if matches date
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
    createFood: function(e) {

      if (e.which !== ENTER_KEY || !this.$input.val().trim()) {
        return;
      }

      this.foodList.create(this.newAttributes());

      this.$input.val('');
    },

    filterByDate: function(){
console.log("In filterByDate", this.appDate)
      //Call render function on filtered food list
      this.filterView(this.foodList.byDate(this.appDate));
    },

    filterView: function(foodList){

      //Set up self to give access to addFood
      self = this;

      //Empty the food list
      self.$list.html('');

      //Repopulate the food list
      foodList.each(function(food){
        self.addFood(food);
      });

      return this;

    }

  });
