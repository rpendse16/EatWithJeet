var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();
var async = require('async');
var fs = require('fs');
mongoose.createConnection('mongodb://localhost/eatswithjeet');
var Page = require('./models').Page;

var yelp = require("yelp").createClient({
	consumer_key: "LAe16RrFtSdVx8N6NSQjOA",
	consumer_secret: "rqeyGFVYpMyDBMCDeqdR2U3oObs",
	token: "udiihYFZFeuQ0YfxQ9Gavxc2icnObqPu",
	token_secret: "oyxIY4Cjt-8Ve-EmRNqQg2BDOKg"
});

var analysis = [];
// See http://www.yelp.com/developers/documentation/v2/search_api
yelp.search({
	term: "food",
	location: "10005"
}, function(error, data) {
	var businessDataArr = data.businesses;
	async.each(businessDataArr, function(businessData, doneOneBusinessData) {
		// For each business data, do a request to its URL
		var oneAnalysisData = new Page({
			name: businessData.name,
			url_name: businessData.url
		});
		request(businessData.url, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				// When the request comes back, look at all the comments
				$ = cheerio.load(body);
				var wordsOfReviews = "";
				$('p[itemprop="description"]').each(function(i, elem) {
					wordsOfReviews += " " + ($(elem).text());
				});
				var arrOfReviews = [];
				arrOfReviews.push(wordsOfReviews);
				async.each(arrOfReviews, function(review, doneOneReview) {
					alchemyapi.keywords("text", review, {sentiment:1, keywordExtractMode: "strict", maxRetrieve: 5}, function(response) {
							var alchemyAnalysis = response;
							console.log('*********************')
							// console.log(alchemyAnalysis);
							// oneAnalysisData.keywords = alchemyAnalysis.keywords;
							console.log(alchemyAnalysis)
							if(alchemyAnalysis.keywords) {
								alchemyAnalysis.keywords.forEach(function(keyword) {
									console.log('     ',keyword)
									oneAnalysisData.keywords.push(keyword);
								});
							}
							doneOneReview(null);
						});
				}, function(err) {
					// analysis.push(oneAnalysisData);
					if(err) throw err;
					console.log('-----------------------')
					console.log(oneAnalysisData);
					oneAnalysisData.save(doneOneBusinessData)
				});
			} else {
				console.log(error)
			}
		});
	}, function(err) {
		console.log(err,'complete')
	});

	// for(x=0; x<data.businesses.length; x++){
	//   	var names = data.businesses[x].name;
	// 		console.log(names);

	// request(data.businesses[0].url, function(error, response, body) {
	// 	if (!error && response.statusCode == 200) {
	// 		$ = cheerio.load(body);

	// 		$('p.review_comment').each(function(i, elem) {
	// 			var review = $(elem).text();
	// 			// console.log(review);

	// 			alchemyapi.keywords("text", review, {
	// 				sentiment: 1,
	// 				keywordExtractMode: "strict",
	// 				maxRetrieve: 5
	// 			}, function(response) {
	// 				// console.log("Keywords: " + response["docSentiment"]["text"]);
	// 				var keyword = JSON.stringify(response);
	// 				console.log(keyword);

	// 			});

	// 		});
	// 	}
	// });
	// }
});