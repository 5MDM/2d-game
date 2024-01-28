import {$} from "../lib/util";
import {Howl} from "howler";

export const audio = {
  music: {},
  sfx: {},
};

export function initAudio(): void {
  $("#c").onclick = () => undefined;
  
  audio.sfx.death = new Howl({
    src: ["assets/audio/death.mp3"],
  });
}