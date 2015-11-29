
  var app = app || {};

  app.FoodView = Backbone.View.extend({

    //Element tag for food items
    tagName:  'tr',

    //Template function for each food item
    template: _.template($('#item-template').html()),

    //Bind functions to events needed for editing and removing food items
    events: {
      'dblclick label.view': 'edit',
      'click .destroy': 'clear',
      'keypress .edit': 'updateOnEnter',
      'blur .edit': 'close'
    },

    //Set up listeners for food items
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Render the food item
    render: function () {

      //get data from Firebase
      this.$el.html( this.template( this.model.attributes ) );

      //Add edit class to input element
      this.$input = this.$('.edit');
      return this;

    },

    //Allow item to be edited
    edit: function () {

      //Change row class to 'editing' mode
      this.$el.addClass('editing');
      this.$input.focus();

    },

    // Close the `editing` mode and save changes to Firebase
    close: function () {
      var value = this.$input.val().trim();

      //If item title exists, save it to Firebase
      if ( value ) {
        this.model.save({ title: value });

      //If item is empty, delete it from Firebase
      } else {
        this.clear();
      }

      //Remove 'editing" class
      this.$el.removeClass('editing');

    },

    //Fire the 'close' function on when hit 'enter' key
    updateOnEnter: function( e ) {
      if (e.which === ENTER_KEY ) {
        this.close();
      }
    },

    //Delete the item from Firebase and remove its view.
    clear: function () {
      this.model.destroy();
    }
  });