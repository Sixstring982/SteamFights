 <?php

 error_reporting(E_ALL);
 ini_set('display_errors', True);
 
 $api_key = "46F2BA68E8ED8EC400AABF1A6E620902";
 
 $app_id = $_GET['app_id'];
 $response = array();
 $message = "An error occurred.";
 $success = FALSE;
 
 do {
 	$page = file_get_contents(sprintf("http://store.steampowered.com/app/%d/", $app_id));
	if(!$page) {
	 	$message = "Request failed.";
		break;
	}
	if(!preg_match('/<b>Genre:<\/b>(.*)/', $page, $m)) {
	 	$message = "Response was an unrecognized format.";
		break;
 	}
	
	$s = $m[1];
	$i = 0;
	$genres = array();
 	while(preg_match('/[, \t]*<a href="[^"]+">([^<]*)<\/a>(.*)/', $s, $m) == 1) {
		$genres[] = $m[1];
		$s = $m[2];
	}
	
	$response["genres"] = $genres;
	$message = "The request was successfully processed.";
	$success = TRUE;
} while(false);

$response["success"] = $success;
$response["message"] = $message;

echo json_encode(array("response" => $response));

 ?> 