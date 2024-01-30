import {Sprite, Texture} from "pixi.js";
import {app} from "../app";

function AABB(a: BoxObject, b: BoxObject): boolean {
  return (
     a.x < b.x + b.width 
  && a.x + a.width > b.x 
  && a.y < b.y + b.height 
  && a.y + a.height > b.y
  );
}

const collisionArray: ((obj: BoxObject) => void)[] = [];

export class Quadtree {
  x: number;
  y: number;
  width: number;
  height: number;
  
  capacity: number = 4;
  total: number = 0;
  children: any = [];
  quadtrees: Quadtree[] = [];
  isLeaf: boolean = false;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    /*if(this.width != this.height) throw new Error(
      "collision.ts: width must be equal to the height "
    + "in quadtree constructor"
    );*/
    
    if(this.width < 1) throw new Error(
      `collision.ts: width or height must be a `
    + `multiple of 2`
    );
    
    if(this.width == 64 
    || this.height == 64) {
      this.isLeaf = true;
    } else {
      this.subdivide();
    }
    
    
    return this;
  }
  
  AABBCurrentBounds(o: BoxObject): boolean {
    return this.x < o.x + o.width 
    && this.x + this.width > o.x 
    && this.y < o.y + o.height 
    && this.y + this.height > o.y;
  }
  
  insert(o: BoxObject): boolean {
    // check if it's in bounds
    if(!this.AABBCurrentBounds(o)) return false;
    
    if(this.isLeaf) {
      /*if(this.total++ > this.capacity) throw new Error(
        "collision.ts: object overflow in tree leaf"
      );*/
      this.children.push(o);
      return true;
    } else {
      for(const tree of this.quadtrees)
        if(tree.insert(o)) return true;
    }
    
    return false;
  }
  
  removeStatic(o: BoxObject): void {
    if(o.isDynamic) throw new Error(
      `collision.ts: dynamic objects can't be
      removed using a static remover`
    );
    
    const parent: Quadtree | boolean = 
    this.getCollisionParent(o);
    
    if(parent) {
      const found: number = 
      (parent as Quadtree).children.indexOf(o);
      
      if(found == -1) throw new Error(
        "collision.ts: deletion error"
      );
      
      (parent as Quadtree).children.splice(found, 1);
      
      o.destroy();
    }
  }
  
  subdivide(): void {
    const {x, y} = this;
    const width = this.width / 2;
    const height = this.height / 2;
    
    this.quadtrees
    .push(new Quadtree(x, y, width, height));
    
    this.quadtrees
    .push(new Quadtree(x + width, y, width, height));
    
    this.quadtrees
    .push(new Quadtree(x, y + height, width, height));
    
    this.quadtrees
    .push(new Quadtree(x + width, y + height, width, height));
  }
  
  onCollision(f: ((obj: BoxObject) => void)) {
    collisionArray.push(f);
  }
  
  getCollisionParent(o: BoxObject): boolean | Quadtree {
    if(!this.AABBCurrentBounds(o)) return false;
    
    if(!this.isLeaf) {
      for(const tree of this.quadtrees) {
        const detected = tree.getCollisionParent(o);
        if(detected) return detected;
      }
      return false;
    } else {
      for(const box of this.children) {
        if(AABB(o, box)) return this;
      }

      return false;
    }
  }
  
  detectCollision(o: BoxObject): boolean | BoxObject {
    if(!this.AABBCurrentBounds(o)) return false;
    
    if(!this.isLeaf) {
      for(const tree of this.quadtrees) {
        const detected = tree.detectCollision(o);
        if(detected) return detected;
      }
      return false;
    } else {
      for(const box of this.children) {
        if(AABB(o, box)) {
          for(const f of collisionArray)
            f(box);
          return box;
        }
      }
      
      return false;
    }
  }
}

var currentQuadtree: Quadtree;

export function setQuadtree(e: Quadtree): void {
  currentQuadtree = e;
}

interface BoxObjectOpts {
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: Sprite;
  isDynamic?: boolean;
  data?: any;
};

var boxId: number = 0;
export class BoxObject {
  lx: number;
  ly: number;
  x: number;
  y: number;
  width: number;
  height: number;
  halfWidth: number;
  halfHeight: number;
  sprite: Sprite;
  isDynamic: boolean;
  dynamicId?: number;
  boxId: number;
  data: any;
  
  constructor(o: BoxObjectOpts) {
    o.data ||= {};
    this.data = o.data;
    this.x = o.x;
    this.y = o.y;
    this.lx = this.x;
    this.ly = this.y;
    this.width = o.width;
    this.height = o.height;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.sprite = o.sprite;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.boxId = ++boxId;
    
    this.isDynamic = o.isDynamic ?? false;
    if(this.isDynamic) this.dynamicId = addDynamicObject(this);
    
    return this;
  }
  
  checkCollision(): boolean | BoxObject {
    if(!this.isDynamic) throw new Error(
      `collision.ts: object at (${this.x}, ${this.y}) `
    + `is not dynamic`
    );
    
    const collided = currentQuadtree.detectCollision(this);
    if(collided) {
      return collided;
    } else {
      return false;
    }
  }
  
  destroy(): void {
    if(this.dynamicId != undefined)
      removeDynamicObject(this.dynamicId);
    
    app.stage.removeChild(this.sprite);
    this.sprite.destroy();
    
    this.dynamicId = NaN;
    this.x = NaN;
    this.y = NaN;
    this.lx = NaN;
    this.ly = NaN;
    this.width = NaN;
    this.height = NaN;
  }
  
  goDown(y: number) {
    this.ly = this.y;
    this.y += y;
    this.sprite.y += y;
    return this;
  }
  
  goUp(y: number) {
    this.ly = this.y;
    this.y -= y;
    this.sprite.y -= y;
    return this;
  }
  
  goLeft(x: number) {
    this.lx = this.x;
    this.x -= x;
    this.sprite.x -= x;
    return this;
  }
  
  goRight(x: number) {
    this.lx = this.x;
    this.x += x;
    this.sprite.x += x;
    return this;
  }
  
  teleport(x: number, y: number) {
    this.teleportX(x);
    this.teleportY(y);
  }
  
  teleportX(x: number) {
    this.lx = x;
    this.x = x;
    this.sprite.x = x;
  }
  
  teleportY(y: number) {
    this.ly = y;
    this.y = y;
    this.sprite.y = y;
  }
  
  goToLastPos() {
    this.teleportX(this.lx);
    this.teleportY(this.ly);
  }
  
  goToLastY() {
    this.teleportY(this.ly);
  }
  
  goToLastX() {
    this.teleportX(this.lx);
  }
  
  calculateOverlapX(o: BoxObject): number {
    return Math.max(0, Math.min(this.x + this.width, o.x + o.width) - Math.max(this.x, o.x))
  }
  
  calculateOverlapY(o: BoxObject): number {
    return Math.max(0, Math.min(this.y + this.height, o.y + o.height) - Math.max(this.y, o.y))
  }
  
  /*collisionSeperation(o: BoxObject): void {
    const overlapX = this.calculateOverlapX(o);
    const overlapY = this.calculateOverlapY(o);
    
    if(overlapX > overlapY) {
      this.goRight(this.x < o.x ? -overlapX : overlapX);
    } else {
      this.goUp(this.y < o.y ? -overlapY : overlapY);
    }
  }*/
  
  collisionSeperationX(o: BoxObject): void {
    const overlapX = this.calculateOverlapX(o);

    this.goRight(this.x < o.x ? -overlapX : overlapX);
  }
  
  collisionSeperationY(o: BoxObject): void {
    const overlapY = this.calculateOverlapY(o);
    
    this.goUp(this.y > o.y ? -overlapY : overlapY);
  }
  
  applyGravity(y: number): boolean {
    this.goDown(y);
    const collided = this.checkCollision();
    if(collided) {
      this.collisionSeperationY(collided as BoxObject);
      return true;
    }
    
    return false;
  }
}

var currentDynamicNumber: number = 0;
const dynamicObjects: any = {};

function addDynamicObject(obj: BoxObject): number {
  dynamicObjects[++currentDynamicNumber] = obj;
  return currentDynamicNumber;
}

function removeDynamicObject(id: number): void {
  delete dynamicObjects[id];
}

var onCollisionFunction: ((obj: BoxObject) => void);

export function collisionStep(): void {
  for(const id in dynamicObjects) {
    const collided = dynamicObjects[id].checkCollision();
    if(collided) {
      onCollisionFunction?.(collided);
    }
  }
}

export function onCollision(f: (() => void)): void {
  onCollisionFunction = f;
}