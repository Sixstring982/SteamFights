 <?php

 error_reporting(E_ALL);
 ini_set('display_errors', True);
 
 $api_key = "46F2BA68E8ED8EC400AABF1A6E620902";
 $test_steam_id = "76561197960434622";
 
 function get_steam_id($username) {
	 global $api_key;
	 $url = sprintf("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=%s&vanityurl=%s", $api_key, $username);
 	$page = file_get_contents($url);
	if(!$page) {
	 	return FALSE;
	}
 	$response = json_decode($page, true); 
 	return $response["response"]["steamid"];
 }
 
 function get_owned_games($steam_id) {
	 global $api_key;
	$url = sprintf("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=%s&steamid=%s&format=json&include_appinfo=1", $api_key, $steam_id);
 	$page = file_get_contents($url);
	if(!$page) {
	 	return FALSE;
	}
	$response = json_decode($page, true); 
	return $response["response"];
 }
 
 function get_genres($app_id) {
 	$page = file_get_contents(sprintf("http://store.steampowered.com/app/%d/", $app_id));
	if(!$page) {
	 	return FALSE;
	}
	if(!preg_match('/<b>Genre:<\/b>(.*)/', $page, $m)) {
	 	return FALSE;
 	}
	$s = $m[1];
	$i = 0;
	
	$retval = array();
 	while(preg_match('/[, \t]*<a href="[^"]+">([^<]*)<\/a>(.*)/', $s, $m) == 1) {
		$retval[] = $m[1];
		$s = $m[2];
	}
	
	return $retval;
}

function cmp($a, $b) {
    return $b['playtime_forever'] - $a['playtime_forever'];
}

function get_player_info($steam_id) {
	global $api_key;
	$url = sprintf("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=%s&steamids=%s", $api_key, $steam_id);
	$page = file_get_contents($url);
	if(!$page) {
	 	return FALSE;
	}
	$response = json_decode($page, true); 
	return $response["response"]["players"][0]; 
}

function get_player_megainfo($username) {
	$steam_id = get_steam_id($username);
	$owned_games = get_owned_games($steam_id);
	$app_ids = array();
	$games = $owned_games["games"];
	$genres_result = array();
	usort($games, "cmp");
	for($i = 0; $i < sizeof($games); $i += 1) {
		$game = $games[$i];
		$appid = $game["appid"];
		$game_name = $game["name"];
		$playtime = $game["playtime_forever"];
		if($i > 10) {
			continue;
		}
		$genres = get_genres($appid);
		if(!$genres) {
			continue;
		}
		for($j = 0; $j < sizeof($genres); $j += 1) {
			$genre = $genres[$j];
			if(!array_key_exists($genre, $genres_result)) {
				$genres_result[$genre] = 0;
			}
			$genres_result[$genre] += $playtime;
		}
	}
	$result = array();
	$result["player"] = get_player_info($steam_id);
	$result["genres"] = $genres_result;
	return $result;
}

echo json_encode(get_player_megainfo($_GET['username']));

 ?> 