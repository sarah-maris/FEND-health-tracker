var app = app || {};

app.FoodView = Backbone.View.extend({

  //Element tag for food items
  tagName:  'tr',

  //Template function for each food item
  itemTemplate: _.template($('#item-template').html()),

  //Bind clear function to clicks on 'destroy' class items
  events: {
    'click .destroy': 'clear',
  },

  //Set up listeners for food items
  initialize: function () {
   // this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  // Render the food item
  render: function () {
console.log("here in render food item")
    //get data from Firebase and render using template
    this.$el.html( this.itemTemplate( this.model.attributes ) );

    return this;

  },

  //Delete the item from Firebase and remove its view.
  clear: function () {
    console.log("here in clear")
    this.model.destroy(
{
   success : function(model) {
       console.log("here in success")
   },
   error : function(
    ) { console.log("here in error")},


}
      );
        console.log("after destroy")
  }
});