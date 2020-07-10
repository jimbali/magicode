<?php

if (!isset($_GET['username']) || !isset($_GET['score']) || !isset($_GET['sessionid'])) {
	die("Error: Incorrect arguments");
}

// Connecting, selecting database
$link = mysql_connect('localhost', 'smallax1_addget', 'kS7F6ed9K')
    or die('Could not connect: ' . mysql_error());
	
mysql_select_db('smallax1_cannon') or die('Could not select database');

$username = mysql_real_escape_string(strip_tags($_GET['username']));
$score = mysql_real_escape_string(strip_tags($_GET['score']));
$sessionid = mysql_real_escape_string($_GET['sessionid']);

// Queries
$timenow = time();

//remove sessions over 24hrs old
$query_removeold = "DELETE FROM sessions WHERE timec < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL -1 DAY)";
$result = mysql_query($query_removeold) or die('Query failed: ' . mysql_error());

//check for sessionid
$query_check = "SELECT timec FROM sessions WHERE sessionid = '$sessionid'";
$result = mysql_query($query_check) or die('Query failed: ' . mysql_error());

//if the session is valid
if (mysql_num_rows($result) > 0)
{
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	$servertime = $row['timec'];

	$timepassed = $timenow - strtotime($servertime);
	
	//if score is not unlikely
	if ($timepassed <= 120 && $score / $timepassed <= 10 || $timepassed > 120 && $score / $timepassed <= 100) {
		
		$query_update = "INSERT INTO highscores (name, score, ip) VALUES ('$username', '$score', '$_SERVER[REMOTE_ADDR]')";
		mysql_query($query_update) or die('Query failed: ' . mysql_error());
		
	} else {
		echo("I don't believe you!");
	}
	
	//delete the session so it can't be reused
	$query_delete = "DELETE FROM sessions WHERE sessionid = '$sessionid'";
	mysql_query($query_delete) or die('Query failed: ' . mysql_error());
	
} else {
	die ("Invalid session.");
}

$query_view = "SELECT name, score FROM highscores ORDER BY score DESC LIMIT 16";
$result = mysql_query($query_view) or die('Query failed: ' . mysql_error());

// Printing results in HTML
echo "<table class=\"highscore\">\n";
while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
    echo "\t<tr>\n";
    foreach ($line as $col_value) {
        echo "\t\t<td>$col_value</td>\n";
    }
    echo "\t</tr>\n";
}
echo "</table>\n";

// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);

?>