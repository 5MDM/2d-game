import {$} from "../lib/util";
import {Howl} from "howler";

interface audioInterface {
  music: any;
  sfx: any;
};

export const audio: audioInterface = {
  music: {},
  sfx: {},
};

export function initAudio(): void {
  (<HTMLElement>$("#c")).onclick = () => undefined;
  
  audio.sfx.death = new Howl({
    src: ["assets/audio/death.mp3"],
    volume: 0.01,
  });
}