import { defineStore } from 'pinia'
import { ref } from 'vue'

// 资源列表
const bitmapSrc = [
  '/img/plane3.png',
  '/img/My_zidan.png',
  '/img/eplane2.gif',
  '/img/ebullet1.png',
]
const animeBitmapSrc = Array.from(
  {length: 9},
  (v, i) => `/img/blow/${i + 1}.png`,
)

export const useBitmapStore = defineStore('bitmap', () => {
  let loaded = false
  /** @const 图片源(0为玩家, 1为玩家子弹, 2为敌机, 3为敌机子弹) */
  const bitmaps = ref([])

  /** @const 爆炸图片源 */
  const blowBitmaps = ref([])

  /**
   * 从url加载bitmap
   */
  const loadBitmapFromUrl = async (url) => {
    const resp = await fetch(url)
    const blob = await resp.blob()
    return await createImageBitmap(blob)
  }

  /**
   *  @function 加载图片
   *  */
  const loadBitmaps = async () => {
    if (loaded) return
    bitmaps.value = await Promise.all(bitmapSrc.map(
      (src) => loadBitmapFromUrl(src)),
    )
    blowBitmaps.value = await Promise.all(
      animeBitmapSrc.map((src) => loadBitmapFromUrl(src)),
    )
    loaded = true
  }


  return {bitmaps, blowBitmaps, loadBitmaps}
})
