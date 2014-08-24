 <?php

 error_reporting(E_ALL);
 ini_set('display_errors', True);
 
 $api_key = "46F2BA68E8ED8EC400AABF1A6E620902";
 $url_param = $_GET['url'];
 
 $url = sprintf("http://api.steampowered.com/%s&key=%s", $url_param,  $api_key);
 $page = file_get_contents($url);
if(!$page) {
 	$response = array("message" => "Request failed.",
		"success" => false);
	echo json_encode($response);
} else {
	echo $page;
}

 ?> 