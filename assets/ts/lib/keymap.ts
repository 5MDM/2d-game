
export class Keymap {
  
  keys: {[key: string]: (x: number, y: number) => void} = {};
  
  onEnd: (() => void);
  
  async run(tx = "") {
    const self = this;
    const txt = tx.split("\n");
    
    for(const y in txt)
      await xLayer(parseInt(y), txt[y].split(""));
    
    async function xLayer(y: number, ySection: string[]) {
      return new Promise(res => {
        for(const x in ySection) {
          const c = ySection[x];
          self.keys[c]?.(parseInt(x), y);
        }
        
        setTimeout(res, 10);
      });
    }
    
    setTimeout(() => this?.onEnd(), txt.length * 10);
  }
  
  key(text: string, func: (x: number, y: number) => void) {
    this.keys[text] = func;
    return this;
  }
}
