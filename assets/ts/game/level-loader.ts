import {$} from "../lib/util";
import {Keymap} from "../lib/keymap";
import {tree, stone, spike, jumpBlock, staticObj, spikeObj, playerObj, grass, setLevel, clearLevel, tpPlayerToSpawn, portal} from "./blocks";
import {initAudio} from "./audio";
import {initPlayer, disableControls, enableControls} from "./player";
import {levels} from "./levels";
import {BoxObject} from "../lib/collision";

var playerBox: BoxObject;
var playerExists: boolean = false;
var currentLevel = 0;
setLevel(currentLevel);

const keymap = new Keymap();

keymap.key("#", (x: number, y: number) => {
  staticObj(x, y, stone);
});

keymap.key("^", (x: number, y: number) => {
  spikeObj(x, y, spike);
});

keymap.key(".", (x: number, y: number) => {
  spikeObj(x, y, spike, -2);
});

keymap.key(">", (x: number, y: number) => {
  spikeObj(x, y, spike, 1);
});

keymap.key("<", (x: number, y: number) => {
  spikeObj(x, y, spike, -1);
});

keymap.key("j", (x: number, y: number) => {
  staticObj(x, y, jumpBlock, {
    hasModifiers: true,
    modifiers: {
      jumpSpeed: -innerHeight / 50,
    },
  });
});

var playerSpawnX: number;
var playerSpawnY: number;

keymap.key("@", (x: number, y: number) => {
  playerSpawnX = x;
  playerSpawnY = y;
});

keymap.onEnd = function() {
  const x = playerSpawnX;
  const y = playerSpawnY;
  
  if(playerExists) {
    disableControls();
    tpPlayerToSpawn(playerBox, x, y);
    enableControls();
  } else {
    playerExists = true;
    const {sprite, box} = playerObj(x, y);
    playerBox = box;
    initPlayer({player: box, tree});
  }
};

keymap.key("*", (x: number, y: number) => {
  staticObj(x, y, portal, {
    isLevelEnd: true,
  });
});

(<HTMLElement>$("#c")).onclick = initAudio;

$("#c").addEventListener("click", () => {
  loadLevel(currentLevel);
  /*fetch("assets/levels/1.txt")
  .then(e => e.text())
  .then(txt => {
    (<HTMLElement>$("#start")).style.display = "none";
    keymap.run(txt);
  });*/
}, {once: true});

function loadLevel(n: number): void {
  if(n != 0) clearLevel();
  (<HTMLElement>$("#start")).style.display = "none";
  keymap.run(levels[n]);
}

export function loadNewLevel(): void {
  currentLevel++;
  clearLevel();
  setLevel(currentLevel);
  loadLevel(currentLevel);
}