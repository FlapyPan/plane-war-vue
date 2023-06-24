/**
 * @class
 * @classdesc 游戏元素类
 */
export class GameObject {
  /**
   * @class
   * @classdesc 游戏元素类
   * @param {CanvasImageSource} img 图片
   * @param {number} x 横坐标
   * @param {number} y 纵坐标
   * @param {number} w 像素宽度
   * @param {number} h 像素高度
   * @param {number} blood 血量
   * @param {number} damage 伤害
   */
  constructor(img, x, y, w, h, blood, damage) {
    this.img = img
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.blood = blood || 1
    this.damage = damage || 1
  }

  /**
   * @property 是否存活
   * @return {boolean}
   */
  get isAlive() {
    return this.blood > 0
  }

  /**
   * @function 碰撞血量计算
   * @param {GameObject} other 另一个需要碰撞的游戏元素
   */
  collide(other) {
    other.blood -= this.damage
    this.blood -= other.damage
  }
}

/**
 * @class
 * @extends {GameObject}
 * @classdesc 自移动游戏元素类
 */
export class MovableGameObject extends GameObject {
  /**
   * @class
   * @extends {GameObject}
   * @classdesc 自移动游戏元素类
   * @param {ImageBitmap} img 图片
   * @param {number} x 横坐标
   * @param {number} y 纵坐标
   * @param {number} w 像素宽度
   * @param {number} h 像素高度
   * @param {number} speedX 横坐标移动像素
   * @param {number} speedY 纵坐标移动像素
   * @param {number} blood 血量
   * @param {number} damage 伤害
   */
  constructor(img, x, y, w, h, speedX, speedY, blood, damage) {
    super(img, x, y, w, h, blood, damage)
    this.speedX = speedX
    this.speedY = speedY
  }

  /**
   * @function 移动元素
   * @param {number} limitX 横坐标限制
   * @param {number} limitY 纵坐标限制
   * @return {boolean} 是否移动成功
   */
  move(limitX, limitY) {
    const newX = this.x + this.speedX
    const newY = this.y + this.speedY
    if (
      newY < -this.h ||
      newX < -this.w ||
      newX > limitX + this.w ||
      newY > limitY + this.h
    ) {
      return false
    }
    this.x = newX
    this.y = newY
    return true
  }
}

/**
 * @class
 * @classdesc 动画对象, 用于渲染gif
 */
export class AnimeGameObject {
  /**
   * @class
   * @classdesc 动画对象, 用于渲染gif
   * @param {CanvasImageSource[]} imgs 图片数组
   * @param {number} x 横坐标
   * @param {number} y 纵坐标
   * @param {number} w 像素宽度
   * @param {number} h 像素高度
   */
  constructor(imgs, x, y, w, h) {
    this.imgs = imgs
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.index = 0
  }

  /**
   * @property 是否画完
   * @return {boolean}
   */
  get drawOver() {
    return this.index >= this.imgs.length
  }

  /**
   * @property 获取一张图片
   * @return {CanvasImageSource}
   */
  get img() {
    return this.imgs[Math.min(this.index++, this.imgs.length - 1)]
  }
}
