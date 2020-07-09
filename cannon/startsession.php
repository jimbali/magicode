<?php

$expires = gmdate('D, d M Y H:i:s', time()-(60*60*24*365*2)) . ' GMT';
header('Expires: '.$expires, true);
header('Cache-Control: no-store, no-cache, must-revalidate'); // HTTP/1.1 
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache'); // HTTP/1.0

$key = 'KilnieEJ439J7H5hOOJfdDioju878DUG8fh8hd';
$timestamp = date("Y-m-d H:i:s");

$link = mysql_connect('localhost', 'smallax1_addget', 'kS7F6ed9K')
    or die('Could not connect: ' . mysql_error());

$tempid = rand().$key;
$sessionid = hash('sha256', $tempid);

mysql_select_db('smallax1_cannon') or die('Could not select database');

$query_update = "INSERT INTO sessions (sessionid, timec, ip) VALUES ('$sessionid', '$timestamp', '$_SERVER[REMOTE_ADDR]')";
if (mysql_query($query_update)) {
    echo $sessionid;
} else {
    die('Query failed: ' . mysql_error());
}
    
mysql_close($link);

?>