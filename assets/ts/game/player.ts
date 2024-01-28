import {Sprite, Ticker} from "pixi.js";
import {$} from "../lib/util";
import {BoxObject} from "../collision";
import {Quadtree} from "../lib/collision";
import {audio} from "./audio";

interface GlobalOpts {
  player?: BoxObject;
  spawnX: number;
  spawnY: number;
  canJump: boolean;
  ogIntertia: number;
  inertia: number;
  controls: {
    right: boolean;
    left: boolean;
    isDisabled: boolean;
  };
  isJumping: boolean;
  jumps: number;
  maxJumps: number;
  maxInertia: number;
  speed: number;
}

const glo: GlobalOpts = {
  player: null,
  spawnX: 0,
  spawnY: 0,
  canJump: false,
  ogIntertia: 15,
  inertia: 0,
  maxInertia: 20,
  controls: {
    right: false,
    left: false,
    isDisabled: false,
  },
  isJumping: false,
  maxJumps: 2,
  jumps: 0,
  speed: innerWidth / 150,
  jumpSpeed: -innerHeight / 63,
};

const ogGlo = {
  speed: glo.speed,
  jumpSpeed: glo.jumpSpeed,
};

function enableControls(): void {
  glo.controls.isDisabled = false;
}

function disableControls(): void {
  glo.controls.isDisabled = true;
  glo.controls.right = false;
  glo.controls.left = false;
  glo.controls.canJump = false;
}

export function initPlayer(o: {player: BoxObject, tree: Quadtree}): void {
  glo.player = o.player;
  glo.spawnX = o.player.x;
  glo.spawnY = o.player.y;
  
  const player = glo.player;
  
  initControls();

  Ticker.shared.add(time => {
    if(glo.controls.isDisabled) return;
    if(!glo.isJumping) {
      if(player.applyGravity(2 + glo.inertia)) {
        glo.inertia = 0;
        glo.canJump = true;
        glo.jumps = 0;
      } else {
        //glo.canJump = false;
        if(glo.inertia < glo.maxInertia) glo.inertia += 0.8;
      }
    } else {
      if(player.applyGravity(2 + glo.inertia)) {
        glo.inertia = 0;
        if(player.applyGravity(0.01)) {
          if(glo.jumps >= glo.maxJumps) glo.canJump = false;
          glo.isJumping = false;
        }
      } else {
        glo.inertia += 0.7;
      }
    }
    
    if(glo.controls.right) player.goRight(glo.speed * time);
    if(glo.controls.left ) player.goLeft (glo.speed * time);
    
    const collided = player.checkCollision();
    if(collided) {
      player.collisionSeperationX(collided);
    }
  });
  
  var sorted: boolean = true;
  var lastModifiers = {};
  o.tree.onCollision((e: BoxObject) => {
    if(e.data.isSpike) death();
    if(e.data.hasModifiers) {
      sorted = false;
      lastModifiers = e.data.modifiers;
      for(const key in e.data.modifiers) {
        glo[key] = e.data.modifiers[key];
      }
    } else {
      if(!sorted) {
        for(const key in lastModifiers)
          glo[key] = ogGlo[key];
        
        sorted = true;
      }
    }
  });
}

function death(): void {
  disableControls();
  glo.player.sprite.tint = 0xfe8247;
  setTimeout(() => {
    glo.player.sprite.tint = 0xffffff;
    glo.player.teleport(glo.spawnX, glo.spawnY);
    enableControls();
  }, 500);
  
  audio.sfx.death.play();
}

function jump() {
  if(glo.canJump) {
    glo.jumps++;
    if(glo.jumps >= glo.maxJumps) glo.canJump = false;
    glo.isJumping = true;
    glo.inertia = glo.jumpSpeed;
  }
}

function initControls() {
  $("#left").addEventListener("click", e => e.preventDefault());
  
  $("#right").addEventListener("click", e => e.preventDefault());
  
  $("#left").addEventListener("pointerdown", e => {
    e.preventDefault();
    if(glo.controls.isDisabled) return;
    glo.controls.left = true;
    glo.controls.right = false;
  });

  $("#right").addEventListener("pointerdown", e => {
    e.preventDefault();
    if(glo.controls.isDisabled) return;
    glo.controls.left = false;
    glo.controls.right = true;
  });

  $("#left").addEventListener("pointerup", e => {
    e.preventDefault();
    glo.controls.left = false;
  });

  $("#right").addEventListener("pointerup", e => {
    e.preventDefault();
    glo.controls.right = false;
  });
  
  window.onkeydown = function(e) {
    const key = e.key;
    if(key == "a") glo.controls.left = true;
    if(key == "d") glo.controls.right = true;
    if(key == "w") jump();
  };

  window.onkeyup = function(e) {
    const key = e.key;
    if(key == "a") glo.controls.left = false;
    if(key == "d") glo.controls.right = false;
  };
  
  $("#c").addEventListener("pointerdown", e => {
    e.preventDefault();
    jump();
  });
}