import {Application} from "pixi.js";
import {$} from "./lib/util";

export const app = new Application({
  background: "#129fff",
  resizeTo: window,
  antialias: false,
  autoDensity: true,
  height: innerWidth,
  width: innerWidth,
  hello: true,
  powerPreference: "low-power",
  resolution: devicePixelRatio,
  view: ($("#c")! as HTMLCanvasElement),
});