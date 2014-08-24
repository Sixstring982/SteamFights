var Elements = {
    canvas: null,
    getCanvas: function() {
        if(this.canvas == null) {
            return (this.canvas = document.getElementById("SteamFightCanvas"));
        }
        return this.canvas;
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

$("#FightButton").on("click", function() {

});

var drawSplash = function() {
    var splash = loadImage("img/splash.png");
    getCanvasContext().drawImage(splash, 0, 0);
}

var SteamFights = {
    ticks: 0,
    tickGame: function() {
        if(((this.ticks)++) % 2) {
            clearBackground();
        } else {
            fillNullImage();
        }
    }
};

var FRAMES_PER_SECOND = 23;
$(document).ready(function() {
    drawSplash();
    //setInterval(function() { SteamFights.tickGame() }, 1000 / FRAMES_PER_SECOND);
});
