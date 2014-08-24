var Elements = {
    canvas: null,
    getCanvas: function() {
        if(this.canvas == null) {
            return (this.canvas = document.getElementById("SteamFightCanvas"));
        }
        return this.canvas;
    },
    get: function(id) {
        return document.getElementById(id);
    }
};

var getCanvasContext = function() {
    return Elements.getCanvas().getContext("2d");
}

var fillBackground = function(color) {
    var ctx = getCanvasContext();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, Elements.getCanvas().width, Elements.getCanvas().height);
};

var clearBackground = function() {
    fillBackground("#0");
};

var loadImage = function(path) {
    var newImg = new Image();
    newImg.src = path;
    if(newImg.width == 0 ||
       newImg.height == 0) {
        return makeNewImage();
    }
    return newImg;
}

var makeNewImage = function() {
    var img = $("#NullImage");
    return img;
}

var fillNullImage = function() {
    var ctx = getCanvasContext();
    var img = makeNewImage();
    var h = Elements.getCanvas().height;
    var w = Elements.getCanvas().width;

    for(x = 0; x < w; x += img.width) {
        for(y = 0; y < h; y += img.height) {
            ctx.drawImage(img, x, y);
        }
    }
}

var drawSplash = function() {
    var splash = loadImage("img/splash.png");
    getCanvasContext().drawImage(splash, 0, 0);
}

var greenBeamElement = loadImage("img/greenBeam.png");
var redBeamElement   = loadImage("img/redBeam.png");

var drawBeamElement = function(x, y, red) {
    var img = red ?
              redBeamElement :
              greenBeamElement;

    getCanvasContext().drawImage(img, x, y);
};

var drawBeams = function(startX, xMiddle, endX, tick) {
    var screenWidth = endX - startX;
    var screenHeight = Elements.getCanvas().height / 2;
    var y;
    tick *= 150;
    for(x = startX; x < endX; x++) {
        y = Math.sin(((x + tick) * Math.PI) / 200.0) * 70 +
            Math.cos(((x + tick) * Math.PI) / 125.0) * 50 +
            Math.cos(Math.sin(((x + tick) * Math.PI) / 1000.0)) * 100 + screenHeight;
        drawBeamElement(x, y, x > xMiddle);
    }
};

var drawBeamsMiddle = function(xMiddle, tick) {
    drawBeams(50, xMiddle, 590, tick);
}

var SteamFights = {
    ticks: 0,
    tickGame: function() {
        this.ticks++;
        clearBackground();
        drawBeamsMiddle(this.ticks * (500.0 / 200.0), this.ticks);
    }
};

$("#FightButton").on("click", function() {
    drawBeams(200, 1);
});

var FRAMES_PER_SECOND = 23;
$(document).ready(function() {
    drawSplash();
    setInterval(function() { SteamFights.tickGame() }, 1000 / FRAMES_PER_SECOND);
});
