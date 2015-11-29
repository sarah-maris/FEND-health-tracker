var app = app || {};

app.getFoodOptions = function(search) {

	var params = {
		'results': '0:20', //Get up to 20 items
		'fields' : 'item_name,brand_name,nf_calories', //Get item, brand and calories
		'appId': '72e7d3f2',
		'appKey': 'be0b61430f161b795ac29ebebfada85a'
	};

	$.ajax({
		type: 'GET',
		url: 'https://api.nutritionix.com/v1_1/search/' + search,
		dataType: 'json',
		data: params,
	})
	.done(function( data ){
		console.log("here is the data", data);
	})
	.fail(function(err){
	//Log Error
		console.log(err);
	});
};