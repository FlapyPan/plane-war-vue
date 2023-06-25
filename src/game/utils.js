/**
 * 判断坐标是否在目标范围内
 */
export const isColliding = (x, y, target) =>
  x > target.x && x < target.x + target.w &&
  y > target.y && y < target.y + target.h

/**
 * 计算两点距离
 */
export const distanceBetweenPoints = (x1, y1, x2, y2) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
