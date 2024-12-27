import {Texture, Sprite, Ticker} from "pixi.js";
import {app} from "../app";
import {$, RADIAN_QUARTER} from "../lib/util";
import {BoxObject, Quadtree, setQuadtree, collisionStep, onCollision} from "../lib/collision";
import {setSpawn} from "./player";

export const tree = new Quadtree(0, 0, 1024 * 2, 1024);
setQuadtree(tree);

const levelContainers: {[index: number]: BoxObject[]} = {};

var currentLevel: number = 1;

export function setLevel(n: number) {
  currentLevel = n;
  if(levelContainers[n] == undefined) 
    levelContainers[n] = [];
}

function addBoxToStage(o: BoxObject): void {
  levelContainers[currentLevel].push(o);
  app.stage.addChild(o.sprite);
}

export function clearLevel() {
  for(const box of levelContainers[currentLevel])
    tree.removeStatic(box);
}


interface imageImportsInterface {
  [key: string]: (() => Promise<{default: string}>);
};

export const imageImports: imageImportsInterface = 
Object.fromEntries(
  Object.entries(
    import.meta.glob<{default: string}>("../../images/**")
  ).map(([key, value]) => [key.slice(13), value]),
);

async function loadImg(e: string) {
  return (await imageImports[e]()).default;
}

export const stone = 
Texture.from(await loadImg("stone.png"));

export const spike =
Texture.from(await loadImg("spike.png"));

const player =
Texture.from(await loadImg("player.png"));

export const jumpBlock =
Texture.from(await loadImg("jump-block.png"));

export const grass = 
Texture.from(await loadImg("grass.png"));

export const portal = 
Texture.from(await loadImg("portal.png"));

var scaleSize = 24;
var playerWidth = scaleSize - 8;
var offsetX = scaleSize;
var offsetY = -scaleSize * 5;


export function tpPlayerToSpawn(o: BoxObject, x: number, y: number): void {
  const px = x * scaleSize + offsetX;
  const py = y * scaleSize + offsetY;
  o.teleport(px, py);
  setSpawn(px, py);
}

if(innerWidth >= 1440) {
  scaleSize = 10;
  playerWidth = 10;
  offsetY = 100;
}

export function playerObj(x: number, y: number): any {
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

export function staticObj(x: number, y: number, texture: Texture, data?: any): BoxObject {
  const sprite = new Sprite(texture);
  const box = new BoxObject({
    x: x * scaleSize + offsetX,
    y: y * scaleSize + offsetY,
    width: scaleSize,
    height: scaleSize,
    sprite,
    data,
  });
  
  addBoxToStage(box);
  tree.insert(box);
  
  return box;
}

export function spikeObj(x: number, y: number, texture: Texture, rotation?: number): BoxObject {
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
  
  addBoxToStage(box);
  tree.insert(box);
  
  return box;
}
