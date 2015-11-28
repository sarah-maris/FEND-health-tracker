

 var app = app || {};

  app.DatePicker = Backbone.View.extend({

    el: '.date-box',

    // Template for the datepicker
    dateTemplate: _.template( $('#date-template').html() ),

    // At initialization we bind to the relevant events on the FoodList collection, when items are added or changed.
    initialize: function () {

      //Get today's date to initialize datepicker
      this.today = new Date();

      //Set current date as default for app
      this.appDate = this.prettyDate(new Date());

      //Render datepicker
      this.render();

      //Set intial date to today
      this.$("#datepicker").datepicker( "setDate", this.today );

    },

    render: function () {

      //Render date picker using template in index.html
      this.$el.html(this.dateTemplate());


      //Set attributes for datepicker
      this.$("#datepicker").datepicker({
        showOn: "both",
        buttonImage: "assets/images/calendar.png",
        buttonImageOnly: true,
        buttonText: "Select date",
        onSelect: this.updateView
      });

    },

    //Format intial date to match mm/dd/yyyy format
    prettyDate: function(date) {
      return ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2)  + "/" + (date.getFullYear().toString());
    },

    //Update foodlist view when date is changed
    updateView: function(dateText, e) {
      appView.appDate =  dateText;
      appView.filterByDate();
    }

  });
