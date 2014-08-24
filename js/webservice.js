
var ATTRIBUTE_MAP = {
	"Action" : "Chaos",
	"Adventure" : "Curiosity",
	"Indie" : "Paragon",
	"RPG" : "Perseverance",
	"Casual" : "Mediocrity",
	"Strategy" : "Intelligence",
	"Simulation" : "Experience"
};

var ATTRIBUTE_NAMES = ["Chaos", 
	"Curiosity", 
	"Paragon", 
	"Perseverance", 
	"Mediocrity", 
	"Intelligence", 
	"Experience"];

var createGame = function() {
	return {
		init: function(opt) {
			this.usernames = opt['usernames'];
			this.onAttributesUpdatedCallback = function() {};
			this.onAttributesCompletedCallback = function() {};
			this.onCompletedCallback = function() {}; 
			this.onInfoUpdatedCallback = function() {}; 
			if(opt['onInfoUpdated']) {
				this.onInfoUpdatedCallback = opt['onInfoUpdated'];
			}
			if(opt['onAttributesUpdated']) {
				this.onAttributesUpdatedCallback = opt['onAttributesUpdated'];
			}
			if(opt['onAttributesCompleted']) {
				this.onAttributesCompletedCallback = opt['onAttributesCompleted'];
			}
			if(opt['onCompleted']) {
				this.onCompletedCallback = opt['onCompleted'];
			}
		},
	
		start: function() {
			var that = this;
			this.callTwice(this.getSteamId, this.usernames, function(steamIds) {
				this.callTwice(this.getOwnedGames, steamIds, function(ownedGames) {
					this.callTwice(this.getPlayerSummaries, steamIds, function(summaries) {
						this.steamIds = steamIds;
						this.ownedGames = ownedGames;
						this.summaries = summaries;
						this.genres = [{}, {}];
						this.attributes = [];
						function compareOwnedGames(a,b) {
						  if (a["playtime_forever"] > b["playtime_forever"])
						     return -1;
						  if (a["playtime_forever"] < b["playtime_forever"])
						    return 1;
						  return 0;
						}
						for(var i = 0; i < 2; ++i) {
							this.ownedGames[i]["games"].sort(compareOwnedGames);
						}
						this.updateAttributes();
						this.onInfoUpdatedCallback();
						this.onAttributesUpdatedCallback();
						
						var completedCount = 0;
						function onComplete() {
							++completedCount;
							if(completedCount >= 2) {
								that.onAttributesCompleted()
							}
						}
						
						this.computeAttributes(0, onComplete);
						this.computeAttributes(1, onComplete);
					});
				});
			});
		},
		
		computeAttributes: function(i, onComplete) {
			var ownedGames = this.ownedGames[i];
			var gameIndex = 0;
			var gamesProcessed = 0;
			var outstandingRequests = 0;
			var that = this;
			var onUpdate = function() {
				that.updateAttributes();
			};
			
			function fetchNextGenres() {
				if(gameIndex >= ownedGames["games"].length || gamesProcessed >= 10) {
					onUpdate.call(this);
					onUpdate = function() {};
					onComplete.call(this);
					onComplete = function() {};
					return;
				}
				
				if(outstandingRequests > 10) {
					return;
				}
				++outstandingRequests;
				var currentGameIndex = gameIndex;
				var appId = ownedGames["games"][gameIndex]["appid"];
				++gameIndex;
				that.getGenres(appId, function(genres) {
					--outstandingRequests;
					if(genres && gamesProcessed < 10) {
						for(var j = 0; j < genres.length; ++j) {
							var key = genres[j];
							if(key in this.genres[i]) {
								this.genres[i][key] += ownedGames["games"][currentGameIndex]["playtime_forever"];
							} else {
								this.genres[i][key] = ownedGames["games"][currentGameIndex]["playtime_forever"];
							}
						}
						++gamesProcessed;
					}
					onUpdate.call(this);
					fetchNextGenres();
				})
			}
			
			fetchNextGenres();
		},
		
		updateAttributes: function() {
			this.attributes[0] = this.getAttributes(this.genres[0]);
			this.attributes[1] = this.getAttributes(this.genres[1]);
			this.onAttributesUpdatedCallback();
		},

		getAttributes: function(genres) {
			var attributes = {};
			for(key in ATTRIBUTE_MAP) {
				if(key in genres) {
					attributes[ATTRIBUTE_MAP[key]] = genres[key];
				} else {
					attributes[ATTRIBUTE_MAP[key]] = 0;
				}
			}
			return attributes;
		},
		
		callSteamApi: function(urlPart, callback) {
			var that = this;
			var url = "http://www.designiscasual.com/SteamFights/api/steam.php?url=" + encodeURIComponent(urlPart);
			$.ajax({
				url: url,
				dataType: 'json'
			}).always(function(data, status, error) {
				if(status != "success" || !data["response"]) {
					callback.call(that, null);
					return;
				}
				if(("success" in data["response"]) && !data["response"]["success"]) {
					if(data["response"]["message"]) {
						console.log(data["response"]["message"]);
					}
					callback.call(that, null);
					return;
				}
				callback.call(that, data);
			});	
		},
		
		callTwice: function(f, args, callback) {
			f.call(this, args[0], function(result1) {
				f.call(this, args[1], function(result2) {
					callback.call(this, [result1, result2]);
				});
			});
		},
		
		getSteamId: function(username, callback) {
			var urlPart = "ISteamUser/ResolveVanityURL/v0001/?vanityurl="+encodeURIComponent(username);
			this.callSteamApi(urlPart, function(data) {
				if(data) {
					callback.call(this, data["response"]["steamid"]);
				} else {
					callback.call(this, null);
				}
			});
		},
		
		getOwnedGames: function(steamId, callback) {
			var urlPart = "IPlayerService/GetOwnedGames/v0001/?format=json&include_appinfo=1&steamid="+encodeURIComponent(steamId);
			this.callSteamApi(urlPart, function(data) {
				if(data) {
					callback.call(this, data["response"]);
				} else {
					callback.call(this, null);
				}
			});
		},
		
		getPlayerSummaries: function(steamIds, callback) {
			var urlPart = "ISteamUser/GetPlayerSummaries/v0002/?steamids="+encodeURIComponent(steamIds);
			this.callSteamApi(urlPart, function(data) {
				if(data) {
					callback.call(this, data["response"]["players"]);
				} else {
					callback.call(this, null);
				}
			});
		},
		
		getGenres: function(appId, callback) {
			var that = this;
			var url = "http://www.designiscasual.com/SteamFights/api/get_genres.php?app_id=" + encodeURIComponent(appId);
			$.ajax({
				url: url,
				dataType: 'json'
			}).always(function(data, status) {
				if(status != "success" || !data["response"]) {
					callback.call(that, null);
					return;
				}
				if(("success" in data["response"]) && !data["response"]["success"]) {
					if(data["response"]["message"]) {
						console.log(data["response"]["message"]);
					}
					callback.call(that, null);
					return;
				}
				callback.call(that, data["response"]["genres"]);
			});	
		},

		onAttributesCompleted: function() {
			this.onAttributesCompletedCallback();
			
			this.scores = [0,0];
			for(var i = 0; i < ATTRIBUTE_NAMES.length; ++i) {
				var attributeName = ATTRIBUTE_NAMES[i];
				if(this.attributes[0][attributeName] > this.attributes[1][attributeName]) {
					this.scores[0] += 1;
				} else if (this.attributes[0][attributeName] < this.attributes[1][attributeName]) {
					this.scores[1] += 1;
				} 
			}
			if(this.scores[0] > this.scores[1]) {
				this.winner = 0;
			} else if(this.scores[0] < this.scores[1]) {
				this.winner = 1;
			} else {
				this.winner = -1;
			}
			this.onCompletedCallback();
		},
		
		onAttributesUpdated: function() {
			this.onAttributesUpdatedCallback();
		},
	};
};


/*

function loadPlayer(username, callback) {
	console.log("loading "+username);
	$.ajax({
		url: 'http://www.designiscasual.com/SteamFights/getinfo.php?username='+username,
		dataType: 'json'
	}).done(function(data) {
		callback.call(null, data);
	});	
}

var player1id;
var player2id;
var player1Info = null;
var player2Info = null;
function loadOneAndTwo() {
	player1id = $("#player1id").val();
	player2id = $("#player2id").val();
	player1Info = loadPlayer(player1id, function(data) {
		player1Info = data;
		if(player2Info != null) {
			onLoadedPlayers();
		}
	});
	player2Info = loadPlayer(player2id, function(data) {
		player2Info = data;
		if(player1Info != null) {
			onLoadedPlayers();
		}
	});
}
var prettyNames = {
	"Action" : "Chaos",
	"Adventure" : "Curiosity",
	"Indie" : "Paragon",
	"RPG" : "Perseverance",
	"Casual" : "Mediocrity",
	"Strategy" : "Intelligence",
	"Simulation" : "Experience"
};
var attributes = ["Chaos", 
	"Curiosity", 
	"Paragon", 
	"Perseverance", 
	"Mediocrity", 
	"Intelligence", 
	"Experience"];

function computePlayerStats(info) {
	var stats = {};
	var genres = info["genres"];
	for(key in prettyNames) {
		if(key in genres) {
			stats[prettyNames[key]] = genres[key];
		} else {
			stats[prettyNames[key]] = 0;
		}
	}
	return stats;
}

function onLoadedPlayers(data) {
	var player1Stats = computePlayerStats(player1Info);
	var player2Stats = computePlayerStats(player2Info);
	var winner = computeWinner(player1Stats, player2Stats);
	if(winner == 1) {
		console.log(player1Info["player"]["personaname"] + " wins!");
	} else if(winner == 2) {
		console.log(player2Info["player"]["personaname"] + " wins!");
	} else {
		console.log("draw!");
	}
	
}

function computeWinner(player1Stats, player2Stats) {
	var player1Score = 0;
	var player2Score = 0;
	for(var i = 0; i < attributes.length; ++i) {
		var attribute = attributes[i];
		if(player1Stats[attribute] > player2Stats[attribute]) {
			player1Score++;
		} else if (player2Stats[attribute] > player1Stats[attribute]) {
			player2Score++;
		} 
	}
	if(player1Score > player2Score) {
		return 1;
	} else if(player1Score < player2Score) {
		return 2;
	} else {
		return 0;
	}
}


function onFightButtonClick() {
	loadOneAndTwo();
}
*/

