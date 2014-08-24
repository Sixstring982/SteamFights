 <?php

 error_reporting(E_ALL);
 ini_set('display_errors', True);
 
 $api_key = "46F2BA68E8ED8EC400AABF1A6E620902";
 $test_steam_id = "76561197960434622";
 
 function get_owned_games($steam_id) {
	 global $api_key;
	$url = sprintf("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=%s&steamid=%s&format=json", $api_key, $steam_id);
 	$page = file_get_contents($url);
	if(!$page) {
	 	return FALSE;
	}
	return $page;
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

var_dump(get_owned_games(214850));

 ?> 