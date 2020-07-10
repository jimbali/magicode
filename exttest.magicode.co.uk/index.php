<?php
sleep(0.1);
?>
<!doctype html>
<html class="no-js" lang="">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>GlastoTest</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="css/main.css">
</head>
<body>
<h2>Auto-refresh plugin instructions and test page</h2>
<article class="test-area">
	<h2>Test Area</h2>
	<?php $success = rand(0, 99) == 0; ?>
	<?php if ($success) { ?>
		<p class="test-text success">Congratulations, you have got through!</p>
	<?php } else { ?>
		<p class="test-text">All of our servers are currently busy.</p>
	<?php } ?>
	<p><?php echo isset($_COOKIE['cookiemonster']) ? "Cookie was set" : "Cookie was NOT set"; ?></p>
</article>
<article class="instructions">
	<h2>Instructions</h2>
	<h3>Introduction</h3>
	<p>This plugin will refresh the current page until a certain text string disappears. This is useful for example if you want to refresh a busy page until it becomes available.</p>
	<h3>Installation</h3>
	<p>You must be using Google Chrome browser on a desktop. Click <a href="https://chrome.google.com/webstore/detail/auto-refresh/bihdppijgcmpiipnbeifnbagcnkgkoda" target="_blank">here</a>
		to open the extension in the Chrome Web Store. Click "add to chrome" and accept any permissions. The extension should now be installed. This icon should now appear in the top of the
		browser window to the right of the address bar: <img width="18px" src="img/icon.png"> (I made it look just like the normal browser refresh button just to confuse you.)</p>
	<h3>Example Usage</h3>
	<p>Select the red text in the test area at the top of this page. Then right click it and choose "Refresh until gone".
		The page will then begin to refresh	and will stop as soon as that text no longer appears. One percent of the time the text will be missing and instead it will
		display a congratulation message instead.</p>
	<p>To try again, refresh the page normally so that the red text is displayed again. Then proceed as before.</p>
	<p>Alternatively, the extension can be controlled with a popup window in the top right of the browser. Click the <img width="18px" src="img/icon.png"> icon and you will see the following
		dialog box:</p>
	<p><img src="img/popup.png"></p>
	<p>You can then change the text to search for and start and stop the refresh process using the buttons. <em>Advanced users:</em> you can also specify the name of a cookie to clear
	each time the page is refreshed. This has not been necessary for our purposes so far.</p>
</article>
</body>
</html>
<?php
setcookie("cookiemonster");
