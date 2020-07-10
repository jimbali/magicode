loadedImages = 0;
angle = 0;
cannonballs = new Array();
planes = new Array();
bombs = new Array();
framesExp = new Array();
explosions = new Array();
audioChannels =  new Array();
//bannerTows = new Array();
nextIndex = 0;
nextPlaneIndex = 0;
nextBombIndex = 0;
nextExplosionIndex = 0;
nextChannel = 2;
cXAnchor = 65;
cYAnchor = 21;
ballSpeed = 0.075;
cannonLength = 165;
frameTime = 30;
gravity = 0.2;
maxBalls = 10;
maxPlanes = 200;
maxBombs = 200;
maxExplosions = 3;
spawnInterval = 2500;
minFireTime = 1000;
score = 0;
dead = false;
paused = false;
timeSinceFire = minFireTime;
lastFrame = (new Date).getTime();
sound = 0;
srcExp = "audio/explosion.mp3";
srcCan = "audio/cannon.mp3";
srcPower = "audio/powerup.mp3";
srcExpOgg = "audio/explosion.ogg";
srcCanOgg = "audio/cannon.ogg";
//srcPowerOgg = "audio/powerup.ogg";
bannerTow = null;
powerUpAlert = null;
stopAudio = 0;
sessionId = "";

function doFirst() {
	canvasElement = document.getElementById('canvas');
	canvas = canvasElement.getContext('2d');
	popup = document.getElementById("popup");
	scoretext = document.getElementById("scoretext");
	
	startSession();
	
	imgBarrel = new Image();
	imgBarrel.src = "barrel.png";
	imgBarrel.onload = loadCheck;
	
	imgCannon = new Image();
	imgCannon.src = "cannon.png";
	imgCannon.onload = loadCheck;
	
	imgBall = new Image();
	imgBall.src = "cannonball.png";
	imgBall.onload = loadCheck;
	
	imgPlane = new Image();
	imgPlane.src = "messerschmitt.png";
	imgPlane.onload = loadCheck;
	
	imgBackdrop = new Image();
	imgBackdrop.src = "spain.jpg";
	imgBackdrop.onload = loadCheck;
	
	imgBomb = new Image();
	imgBomb.src = "bomb.png";
	imgBomb.onload = loadCheck;
	
	imgBannerTow = new Image();
	imgBannerTow.src = "bannertow.png";
	imgBannerTow.onload = loadCheck;
	
	imgRate = new Image();
	imgRate.src = "rate.png";
	imgRate.onload = loadCheck;
	
	var p = 0;
	for (i = 38; i <= 83; i += 3) {
		framesExp[p] = new Image();
		framesExp[p].src = "explosion/etest00" + i + ".png";
		framesExp[p++].onload = loadCheck;
	}
	
	button = document.getElementById('button');
	audioChannels[0] = document.getElementById('audio1');
	
	//detect iOS devices
	if (navigator.userAgent.match(/like Mac OS X/i)) {
    	iOS = true;
		maxChannels = 1;
		alert('To enable sound, please press the \"Enable Sounds\" button.');
		audioChannels[0].src = "audio/audiosprite.mp3";
    } else {
		iOS = false;
		maxChannels = 5;
		soundToggle();
		for (i = 1; i <= maxChannels; i++) {
			var name = "audio" + i;
			audioChannels[i - 1] = document.getElementById(name);
			//1st channel is for cannon, 2nd for power up, rest are for explosion
			switch (i) {
			case 1:
				var source = document.createElement('source');
				source.type = 'audio/mpeg';
				source.src= srcCan;
				audioChannels[i - 1].appendChild(source);
				source = document.createElement('source');
				source.type = 'audio/ogg';
				source.src = srcCanOgg;
				audioChannels[i - 1].appendChild(source);
				audioChannels[i - 1].load();
				break;
			case 2:
				var source = document.createElement('source');
				source.type = 'audio/mpeg';
				source.src= srcPower;
				audioChannels[i - 1].appendChild(source);
				/*
				source = document.createElement('source');
				source.type = 'audio/ogg';
				source.src = srcCanOgg;
				audioChannels[i - 1].appendChild(source);
				*/
				audioChannels[i - 1].load();
				break;
			default:
				var source = document.createElement('source');
				source.type = 'audio/mpeg';
				source.src= srcExp;
				audioChannels[i - 1].appendChild(source);
				source = document.createElement('source');
				source.type = 'audio/ogg';
				source.src = srcExpOgg;
				audioChannels[i - 1].appendChild(source);
				audioChannels[i - 1].load();
			}
		}
	}
}

function startSession() {
	$.ajax({
		url: 'startsession.php',
		success: function(data) {
			sessionId = data;
		}
	});
}

function loadCheck() {
	loadedImages++;
	canvas.fillStyle = "#0000E1";
	canvas.fillRect(canvasElement.width/2 - 100, canvasElement.height/2 - 10, loadedImages / 23 * 200, 20);
	if (loadedImages >= 24) whenLoaded();
}

function whenLoaded() {
	lastFrame = (new Date).getTime();
	cannonX = 0;
	cannonY = canvasElement.height - imgCannon.height;
	pivotX = cannonX + 185;
	pivotY = cannonY + 11;
	draw();
	canvasElement.addEventListener("mousemove", adjustCannon, false);
	canvasElement.addEventListener("click", fireBall, false);
	button.addEventListener("click", soundToggle, false);
	setTimeout(spawnPlane, spawnInterval);
	setInterval(gameLoop, frameTime);
	setInterval(quickerSpawn, 5000);
	setTimeout(spawnBannerTow, 2 * 60 * 1000);
}

function gameLoop() {
	if (paused) return;
	var curTime = (new Date).getTime();
	var dt = curTime - lastFrame;
	lastFrame = curTime;
	updateAll(dt);
	draw();
}

function pause() {
	paused = true;
}

function resume() {
	lastFrame = (new Date).getTime();
	paused = false;
}

function quickerSpawn() {
	if (spawnInterval > 100) {
		spawnInterval -= 50;
	}
}

function draw() {
	//canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvas.drawImage(imgBackdrop, 0, 0);
	
	//draw fire limiter bar
	var t = (timeSinceFire < minFireTime) ? timeSinceFire : minFireTime;
	var barWidth = 200 * t / minFireTime;
	var x = canvasElement.width - 200 - 20;
	var y = canvasElement.height - 20 - 20;
	canvas.fillStyle = "#E00000";
	canvas.fillRect(x, y, barWidth, 20);
	canvas.strokeStyle = "#000000";
	canvas.strokeRect(x, y, barWidth, 20);
	
	//rotate and draw barrel
	canvas.save();
    canvas.translate(pivotX, pivotY);
    canvas.rotate(angle);
    canvas.translate(-cXAnchor, -cYAnchor);
    canvas.drawImage(imgBarrel, 0, 0);
    canvas.restore();
	
	//draw balls
	for (i = 0; i < cannonballs.length; i++) {
		if (cannonballs[i] != null) {
			canvas.drawImage(imgBall, cannonballs[i].x, cannonballs[i].y, 15, 15);
		}
	}
	
	//draw bombs
	for (i = 0; i < bombs.length; i++) {
		if (bombs[i] != null) {
			canvas.drawImage(imgBomb, bombs[i].x, bombs[i].y, 100 * bombs[i].scale, 27 * bombs[i].scale);
		}
	}
	
	//draw planes
	for (i = 0; i < planes.length; i++) {
		if (planes[i] != null) {
			canvas.drawImage(imgPlane, planes[i].x, planes[i].y, 227 * planes[i].scale, 198 * planes[i].scale);
		}
	}
	
	//draw bonus planes
	if (bannerTow != null) {
		bannerTow.draw(canvas);
	}
	
	//draw power up alert
	if (powerUpAlert != null) {
		powerUpAlert.draw(canvas);
	}
	
	//draw explosions
	for (i = 0; i < explosions.length; i++) {
		if (explosions[i] != null) {
			if (explosions[i].frameNum >= 16) {
				explosions[i] = null;
			} else {
				canvas.drawImage(framesExp[explosions[i].frameNum], explosions[i].x, explosions[i].y);
			}
		}
	}
	
	canvas.drawImage(imgCannon, cannonX, cannonY, 243, 130);
	canvas.font = "18pt Tahoma bold";
	canvas.fillStyle = "#F0F0F0";
	canvas.fillText("Score: " + score, 10, 30);
	canvas.strokeStyle = "#000000";
	canvas.strokeText("Score: " + score, 10, 30);
	
}

function adjustCannon(e) {
	if (dead) return;
	var mouseX = e.pageX - canvasElement.offsetLeft;
	var mouseY = e.pageY - canvasElement.offsetTop;
	var dx = mouseX - pivotX;
	var dy = mouseY - pivotY;
	if (dy >= 0) {
		var newAngle = Math.atan(dx / -dy) + Math.PI / 2;
	} else {
		var newAngle = Math.atan(dx / -dy) + Math.PI * 3 / 2;
	}
	
	//don't let it go too low
	if (newAngle > 0.75 && newAngle < Math.PI / 2) {
		angle = 0.75;
	} else if (newAngle > Math.PI / 2 && newAngle < 2.35) {
		angle = 2.35;
	} else {
		angle = newAngle;
	}
	
}

function spawnPlane() {
	var scale = Math.random() * 0.8 + 0.2;
	var y = Math.floor(Math.random() * 100);
	var vx = Math.random() * -2.0 - 1.0;
	planes[nextPlaneIndex++] = new Plane(y, scale, vx);
	if (nextPlaneIndex >= maxPlanes) nextPlaneIndex = 0;
	setTimeout(spawnPlane, spawnInterval);
}

function spawnBannerTow() {
	bannerTow = new BannerTow("rate", -4.0);
	if (spawnInterval >= 2500) {
		setTimeout(spawnBannerTow, 2 * 60 * 1000);
	} else if (spawnInterval >= 1250) {
		setTimeout(spawnBannerTow, 60 * 1000);
	} else if (spawnInterval >= 625) {
		setTimeout(spawnBannerTow, 45 * 1000);
	}
}

function dropBomb(plane) {
	bombs[nextBombIndex++] = new Bomb(plane);
	if (nextBombIndex >= maxBombs) nextBombIndex = 0;
}

function fireBall(e) {
	if (timeSinceFire < minFireTime || dead) return;
	timeSinceFire = 0;
	var mouseX = e.pageX - canvasElement.offsetLeft;
	var mouseY = e.pageY - canvasElement.offsetTop;
	var dx = mouseX - pivotX;
	var dy = mouseY - pivotY;
	var h = Math.sqrt(dx*dx + dy*dy);
	var ratio = cannonLength / h;
	var x = pivotX + ratio * dx - 8;
	var y = pivotY + ratio * dy - 8;
	cannonballs[nextIndex++] = new Cannonball(x, y);
	if (nextIndex >= maxBalls) nextIndex = 0;
	playSound(srcCan);
}

//main update method
function updateAll(dt) {
	
	//update fire limiter
	timeSinceFire += dt;
	
	//update animations
	for (i = 0; i < cannonballs.length; i++) {
		if (cannonballs[i] != null) cannonballs[i].update(dt);
	}
	for (i = 0; i < planes.length; i++) {
		if (planes[i] != null) planes[i].update(dt);
	}
	for (i = 0; i < bombs.length; i++) {
		if (bombs[i] != null) bombs[i].update(dt);
	}
	for (i = 0; i < explosions.length; i++) {
		if (explosions[i] != null) explosions[i].update(dt);
	}
	if (bannerTow != null) {
		bannerTow.update(dt);
		if (bannerTow.x + 81 < 0) {
			bannerTow = null;
		}
	}
	
	if (powerUpAlert != null) {
		//update and delete if necessary
		if (powerUpAlert.update(dt)) {
			powerUpAlert = null;
		}
	}
		
	//check for collisions
	
	//cannonball/plane
	for (i = 0; i < cannonballs.length; i++) {
		if (cannonballs[i] != null) {
			for (j = 0; j < planes.length; j++) {
				if (planes[j] != null && checkCollision(cannonballs[i], planes[j])) {
					explosions[nextExplosionIndex++] = new Explosion(planes[j].x, planes[j].y, 139 * planes[j].scale - 135, 99 * planes[j].scale - 96);
					if (nextExplosionIndex >= maxExplosions) nextExplosionIndex = 0;
					planes[j] = null;
					cannonballs[i] = null;
					score += 10;
					playSound(srcExp);
					continue;
				}	
			}
			
			//or cannonball/bannerTow
			if (bannerTow != null && checkCollision(cannonballs[i], bannerTow)) {
				//explosions[nextExplosionIndex++] = new Explosion(bannerTow.x, bannerTow.y, -49, -56);
				//if (nextExplosionIndex >= maxExplosions) nextExplosionIndex = 0;
				powerUpAlert = new PowerUpAlert(bannerTow.x + 41, bannerTow.y + 20, "rate");
				bannerTow = null;
				cannonballs[i] = null;
				playSound(srcPower);
			}
		}
	}
	
	//bomb/cannon
	for (i = 0; i < bombs.length; i++) {
		var b = bombs[i];
		if (b == null) continue;
		if (b.x < cannonX + 243 && b.x + 100 * b.scale > cannonX && b.y + 27 * b.scale > cannonY & b.y < cannonY + 130) {
			if (!dead) {
				dead = true;
				setTimeout(function() {
									pause();
									window.alert("You Died!!! Refresh the page to try again!");
									resume();
									popup.style.display = "block";
									scoretext.innerHTML = "Well done, your score was: " + score + "<br>Enter your name:";
									}, 1000);
			}
			explosions[nextExplosionIndex++] = new Explosion(b.x, b.y, 50 * b.scale - 128, 14 * b.scale - 96);
			if (nextExplosionIndex >= maxExplosions) nextExplosionIndex = 0;
			bombs[i] = null;
			playSound(srcExp);
		}
	}
}

function checkCollision(b, p) {
	if (b == null || p == null) return false;
	if (b.bounds().right >= p.bounds().left && b.bounds().left <= p.bounds().right && b.bounds().bottom >= p.bounds().top && b.bounds().top <= p.bounds().bottom) {
		return true;
	} else {
		return false;
	}
}

function soundToggle() {
    if (!sound) {
        audioChannels[0].load();
        sound = 1;
        button.value="Turn Sounds Off";
    } else {
        sound = 0;
        button.value="Enable Sounds";
    }
}

function playSound(src) {
	if (sound == 0) return;
	if (iOS) {
		window.clearTimeout(stopAudio);
		audioChannels[0].pause();
		if (src == srcCan) {
			audioChannels[0].currenttime = 0;
			audioChannels[0].play();
			stopAudio = setTimeout(function() {
				audioChannels[0].pause();
			}, 750);
		} else if (src == srcExp) {
			while (audioChannels[0].currenttime < 1.0) {
				audioChannels[0].currenttime = 1.0;
			}
			audioChannels[0].play();
		}
	} else {
		if (src == srcCan) {		
			audioChannels[0].currenttime = 0;
			audioChannels[0].play();
		} else if (src == srcPower) {
			audioChannels[1].currenttime = 0;
			audioChannels[1].play();
		} else if (src == srcExp) {
			audioChannels[nextChannel].currenttime = 0;
			audioChannels[nextChannel++].play();
		}
		if (nextChannel >= maxChannels) nextChannel = 2;
	}	
}

//Cannonball object
function Cannonball(newX, newY) {
	this.x = newX;
	this.y = newY;
	this.vx = (newX - pivotX) * ballSpeed;
	this.vy = (newY - pivotY) * ballSpeed;
	this.update = ballUpdate;
	this.bounds = ballBounds;
}

function ballUpdate(dt) {
	this.vy += gravity * dt / frameTime;
	this.x += this.vx * dt / frameTime;
	this.y += this.vy * dt / frameTime;
}

function ballBounds() {
	var r = new Rectangle();
	r.left = this.x;
	r.top = this.y;
	r.right = this.x + 15;
	r.bottom = this.y + 15;
	return r;
}
//end ball

//Plane object
function Plane(newY, s, newVx) {
	this.x = canvasElement.width;
	this.y = newY;
	this.bombProb = 0;
	this.scale = s;
	this.vx = newVx;
	this.update = planeUpdate;
	this.bounds = planeBounds;
}

function planeUpdate(dt) {
	this.x += this.vx * dt / frameTime;
	this.bombProb += dt / frameTime;
	if (this.bombProb >= Math.random() * 10000) {
		dropBomb(this);
		this.bombProb = 0;
	}
}

function planeBounds() {
	var r = new Rectangle();
	r.left = this.x + 19 * this.scale;
	r.top = this.y + 61 * this.scale;
	r.right = r.left + 258 * this.scale;
	r.bottom = r.top + 62 * this.scale;
	return r;
}
//end plane

//Bomb object
function Bomb(plane) {
	this.x = plane.x + (20 * plane.scale);
	this.y = plane.y + (100 * plane.scale);
	this.scale = plane.scale;
	this.vx = plane.vx;
	this.vy = 0;
	this.update = bombUpdate;
	this.bounds = bombBounds;
}

function bombUpdate(dt) {
	this.vy += gravity * dt / frameTime
	this.y += this.vy * dt / frameTime;
	this.x += this.vx * dt / frameTime;
}

function bombBounds() {
	var r = new Rectangle();
	r.left = this.x;
	r.top = this.y;
	r.right = r.left + 100 * this.scale;
	r.bottom = r.top + 27 * this.scale;
	return r;
}
//end bomb

//BannerTow object
function BannerTow(type, vx) {
	this.type = type;
	if (type == "rate") {
		this.text = "FASTER RELOAD";
	} else {
		this.text = "NO TEXT";
	}
	this.x = canvasElement.width;
	this.initY = Math.random() * 100 + 50;
	this.y = this.initY;
	this.timePassed = 0;
	this.vx = vx;
	this.update = bannerTowUpdate;
	this.draw = bannerTowDraw;
	this.bounds = bannerTowBounds;
}

function bannerTowUpdate(dt) {
	this.x += this.vx * dt / frameTime;
	this.y = this.initY + 20 * Math.sin(this.x * Math.PI / 180);
}

function bannerTowDraw(canvas) {
	canvas.drawImage(imgBannerTow, this.x, this.y, 81, 40);
	canvas.font = "10pt Tahoma bold";
	canvas.fillStyle = "#1F1F1F";
	for (i = 0; i < this.text.length; i++) {
		var x = this.x + 100 + i * 20;
		var y = this.initY + 30 + 20 * Math.sin(x * Math.PI / 180);
		canvas.fillText(this.text.charAt(i), x, y);
	}
}

function bannerTowBounds() {
	var r = new Rectangle();
	r.left = this.x;
	r.top = this.y;
	r.right = r.left + 81;
	r.bottom = r.top + 40;
	return r;
}
//end BanerTow

//Explosion object
function Explosion(newX, newY, xOffset, yOffset) {
	this.x = newX + xOffset;
	this.y = newY + yOffset;
	this.frameNum = 0;
	this.timeElapsed = 0;
	this.update = explosionUpdate;
}

function explosionUpdate(dt) {
	this.timeElapsed += dt;
	while (this.timeElapsed >= this.frameNum * frameTime) {
		this.frameNum++;
	}
}
//end explosion

//PowerUpAlert object
function PowerUpAlert(newX, newY, type) {
	this.x = newX;
	this.y = newY;
	this.type = type;
	this.timeElapsed = 0;
	this.totalTime = 1000;
	if (type == "rate") minFireTime /= 2;
	this.update = powerUpAlertUpdate;
	this.draw = powerUpAlertDraw;
}

function powerUpAlertUpdate(dt) {
	this.timeElapsed += dt;
	var finished;
	if (this.timeElapsed >= (this.totalTime * (Math.sqrt(2) + 1)) / 2) {
		finished = true;
	}
	return finished;
}

function powerUpAlertDraw(canvas) {
	var scale = 2 - Math.pow(2 * this.timeElapsed / this.totalTime - 1, 2);
	if (scale <= 0) return;
	var width = 100 * scale;
	var height = 75 * scale;
	canvas.drawImage(imgRate, this.x - width/2, this.y - height/2, width, height);
}
//end powerUpAlert

function Rectangle() {
	this.left = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;
}

//jquery ajax score submitter
$('#send').click(function() {
	var username = $('#username').val();
	$.ajax({
		url: 'highscore.php',
		data: 'username=' + username + '&score=' + score + '&sessionid=' + sessionId,
		success: function(data) {
			$('#popup').html("<h1>High Scores</h1>" + data);
		}
	});
		
});

window.addEventListener("load", doFirst, false);