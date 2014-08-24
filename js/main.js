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

var Particle = function(x, y) {
    this.initialX = x;
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.gravy = 0;
    this.dir = Math.random() * 2 * Math.PI;
    this.vel = Math.random() * 25 + 1;
    this.alive = true;
}

var drawParticle = function(p) {
    if(p.alive) {
        var ctx = getCanvasContext();
        var oldFill = ctx.fillStyle;
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.fillStyle = oldFill;
    }
}

var renderParticles = function(particles) {
    for(x = 0; x < particles.length; x++) {
        drawParticle(particles[x]);
    }
}

var updateParticle = function(p, tick) {
    if(p.alive) {
        p.x += p.vel * Math.cos(p.dir);
        p.y += p.vel * Math.sin(p.dir);
        p.gravy++;
        p.y += p.gravy;
        if(Math.pow(p.x - p.initialX, 2) + Math.pow(p.y - p.initialY, 2) > 500000) {
            p.alive = false;
        }
    }
}

var updateParticles = function(particles, tick) {
    for(x = 0; x < particles.length; x++) {
        updateParticle(particles[x], tick);
    }
}

var setupNewParticle = function(particles, x, y) {
    for(i = 0; i < particles.length; i++) {
        if(!particles[i].alive) {
            particles[i] = new Particle(x, y);
            return;
        }
    }
    particles.push(new Particle(x, y));
}

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
var lightningElement = loadImage("img/lightning.png");

var drawBeamElement = function(x, y, red) {
    var img = red ?
              redBeamElement :
              greenBeamElement;

    getCanvasContext().drawImage(img, x, y);
};

var BEAM_SPEED = 20;
var BEAM_AMPLITUDE = 10;
var BEAM_HEIGHT_COEFF_1 = 1.5 * BEAM_AMPLITUDE;
var BEAM_HEIGHT_COEFF_2 = 1   * BEAM_AMPLITUDE;
var BEAM_HEIGHT_COEFF_3 = 2   * BEAM_AMPLITUDE;
var TICK_TO_MIDDLE_X_INTERVAL = 100;
var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;
var HALF_SCREEN_WIDTH = SCREEN_WIDTH / 2;


var drawBeams = function(startX, xMiddle, endX, tick, particles) {
    var screenWidth = endX - startX;
    var screenHeight = Elements.getCanvas().height / 2;
    var y;
    var midY;
    tick *= BEAM_SPEED;
    for(x = startX; x < endX; x++) {
        y = Math.sin(((x + tick) * Math.PI) / 200.0) * BEAM_HEIGHT_COEFF_1 +
            Math.cos(((x + tick * 1.2) * Math.PI) / 125.0) * BEAM_HEIGHT_COEFF_2 +
            Math.cos(Math.sin(((x + tick * 1.1) * Math.PI) / 1000.0)) * BEAM_HEIGHT_COEFF_3 +
            screenHeight;
        drawBeamElement(x, y, x > xMiddle);

        if(x == xMiddle) {
            midY = y;
        }
    }

    if((tick / BEAM_SPEED) < TICK_TO_MIDDLE_X_INTERVAL * 5) {
        var ctx = getCanvasContext();
        ctx.save();
        ctx.translate(xMiddle, midY);
        ctx.rotate(Math.random() * 2 * Math.PI);
        ctx.drawImage(lightningElement, -lightningElement.width / 2,
                      -lightningElement.height / 2);
        ctx.restore();
        setupNewParticle(particles, xMiddle, midY);
    }
};

var tickToMiddleX = function(tick, winner) {
    if(tick < TICK_TO_MIDDLE_X_INTERVAL) {
        return tick + HALF_SCREEN_WIDTH;
    } else if(tick < TICK_TO_MIDDLE_X_INTERVAL * 2) {
        return (TICK_TO_MIDDLE_X_INTERVAL + HALF_SCREEN_WIDTH) -
               (2 * tick - TICK_TO_MIDDLE_X_INTERVAL);
    } else if(tick < TICK_TO_MIDDLE_X_INTERVAL * 3) {
        return tick + HALF_SCREEN_WIDTH / 2;
    } else if(tick < TICK_TO_MIDDLE_X_INTERVAL * 4) {
        return (TICK_TO_MIDDLE_X_INTERVAL + HALF_SCREEN_WIDTH) -
               (2 * (tick / 3) - TICK_TO_MIDDLE_X_INTERVAL);
    } else if(tick < TICK_TO_MIDDLE_X_INTERVAL * 5) {
        return (winner ? (-tick * 2) : tick) +
               (winner ? 1000 :
                HALF_SCREEN_WIDTH / 3.5);
    } else {
        return winner ? 0 : SCREEN_WIDTH;
    }
}

var determineWinner = function() {
    return false; //TODO return the winner, false for Player1 (left)  winning
}

var drawBeamsMiddle = function(tick, particles) {
    drawBeams(0, Math.round(tickToMiddleX(tick, determineWinner())), SCREEN_WIDTH, tick, particles);
}

var SteamFights = {
    ticks: 0,
    particles: [],
    tickGame: function() {
        this.ticks++;
        clearBackground();
        drawBeamsMiddle(this.ticks * (500.0 / 200.0), this.particles);
        updateParticles(this.particles, this.ticks);
        renderParticles(this.particles);
    }
};

$("#FightButton").on("click", function() {
    Elements.get("gong").play();
});

var FRAMES_PER_SECOND = 23;
$(document).ready(function() {
    drawSplash();
    setInterval(function() { SteamFights.tickGame() }, 1000 / FRAMES_PER_SECOND);
});
