import {Texture, Sprite, Ticker} from "pixi.js";
import {Keymap} from "../lib/keymap";
import {app} from "../app";
import {$, RADIAN_QUARTER} from "../lib/util";
import {BoxObject, Quadtree, setQuadtree, collisionStep, onCollision} from "../lib/collision";
import {initPlayer} from "./player";
import {initAudio} from "./audio";
import {levels} from "./levels";

const tree = new Quadtree(0, 0, 1024 * 2, 1024);
setQuadtree(tree);

const stone = 
Texture.from("assets/images/stone.png");

const spike =
Texture.from("assets/images/spike.png");

const player =
Texture.from("assets/images/player.png");

const jumpBlock =
Texture.from("assets/images/jump-block.png");

var scaleSize = 32;
var playerWidth = scaleSize - 8;
var offsetX = scaleSize;
var offsetY = -scaleSize * 5;

if(innerWidth >= 1440) {
  scaleSize = 10;
  playerWidth = 10;
  offsetY = 100;
}

function playerObj(x: number, y: number): any {
  const sprite = new Sprite(player);
  const box = new BoxObject({
    x: x * scaleSize + offsetX,
    y: y * scaleSize + offsetY,
    width: playerWidth,
    height: scaleSize,
    sprite,
    isDynamic: true,
  });
  sprite.anchor.set(0.1, 0);
  sprite.width = scaleSize;
  sprite.height = scaleSize;
  
  app.stage.addChild(sprite);

  return {box, sprite};
}

function staticObj(x: number, y: number, texture: Texture, data?: any): BoxObject {
  const sprite = new Sprite(texture);
  const box = new BoxObject({
    x: x * scaleSize + offsetX,
    y: y * scaleSize + offsetY,
    width: scaleSize,
    height: scaleSize,
    sprite,
    data,
  });
  app.stage.addChild(sprite);
  
  tree.insert(box);
  return box;
}

function spikeObj(x: number, y: number, texture: Texture, rotation?: number): BoxObject {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 0.5);
  
  const box = new BoxObject({
    x: x * scaleSize + offsetX + 10,
    y: y * scaleSize + offsetY + 10,
    width: scaleSize / 2,
    height: scaleSize / 3,
    sprite,
    data: {isSpike: true},
  });
  sprite.x = x * scaleSize + offsetX;
  sprite.y = y * scaleSize + offsetY;
  sprite.width = scaleSize;
  sprite.height = scaleSize;
  sprite.x += sprite.width / 2;
  sprite.y += sprite.height / 2;
  
  if(rotation) sprite.rotation = rotation * (Math.PI / 2);
  
  app.stage.addChild(sprite);

  tree.insert(box);
  return box;
}

const keymap = new Keymap();

keymap.key("#", (x: number, y: number) => {
  staticObj(x, y, stone);
});

keymap.key("^", (x: number, y: number) => {
  spikeObj(x, y, spike);
});

keymap.key(">", (x: number, y: number) => {
  spikeObj(x, y, spike, -1);
});

keymap.key("<", (x: number, y: number) => {
  spikeObj(x, y, spike, 1);
});

keymap.key("j", (x: number, y: number) => {
  staticObj(x, y, jumpBlock, {
    hasModifiers: true,
    modifiers: {
      jumpSpeed: -innerHeight / 50,
    },
  });
});

keymap.key("@", (x: number, y: number) => {
  const {sprite, box} = playerObj(x, y);
  initPlayer({player: box, tree});
});

(<HTMLElement>$("#c")).onclick = initAudio;

$("#c").addEventListener("click", () => {
  /*fetch("assets/levels/1.txt")
  .then(e => e.text())
  .then(txt => {
    (<HTMLElement>$("#start")).style.display = "none";
    keymap.run(txt);
  });*/
  (<HTMLElement>$("#start")).style.display = "none";
  keymap.run(levels[0]);
}, {once: true});