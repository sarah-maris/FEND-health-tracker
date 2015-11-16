
  var app = app || {};

  // The DOM element for a food item...
  app.FoodView = Backbone.View.extend({

    //... is a list tag.
    tagName:  'tr',

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      'click .toggle': 'toggleCompleted',
      'dblclick .food-item.view': 'edit',
      'click .destroy': 'clear',
      'keypress .edit': 'updateOnEnter',
      'blur .edit': 'close'
    },

    // The FoodView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Food** and a **FoodView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
      this.listenTo(this.model, 'visible', this.toggleVisible);
    },

    // Re-render the titles of the food item.
    render: function () {

      //get data from Firebase
      this.$el.html( this.template( this.model.attributes ) );
      this.$el.toggleClass('completed', this.model.get('completed'));
      this.toggleVisible();

      this.$input = this.$('.edit');
      return this;
    },

    //Toggles visibility of item
    toggleVisible: function () {
      this.$el.toggleClass('hidden', this.isHidden());
    },

    //Determines if item should be hidden
    isHidden : function () {
      var isCompleted = this.model.get('completed');
      return ( // hidden cases only
        (!isCompleted && app.FoodFilter === 'completed') || (isCompleted && app.FoodFilter === 'active')
      );
    },

    //Toggle the `"completed"` state of the model.
    toggleCompleted: function () {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function () {
console.log("EDITIING!")
      this.$el.addClass('editing');
      this.$input.focus();
    },

    // Close the `"editing"` mode, saving changes to the food item.
    close: function () {
      var value = this.$input.val().trim();

      if ( value ) {
        this.model.save({ title: value });
      } else {
        this.clear();
      }

      this.$el.removeClass('editing');
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function( e ) {
      if (e.which === ENTER_KEY ) {
        this.close();
      }
    },

    //Remove the item, destroy the model in Firebase and delete its view.
    clear: function () {
      this.model.destroy();
    }
  });