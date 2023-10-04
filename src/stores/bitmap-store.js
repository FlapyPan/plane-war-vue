import { defineStore } from 'pinia'
import { ref } from 'vue'
import assets from '@/game/assets'
import { useLocalStorage } from '@vueuse/core'

export const useBitmapStore = defineStore('bitmap', () => {
  const currentAssetsMod = useLocalStorage('assets-mod', { index: 0 })

  let loaded = false

  const bg = ref(null)

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
    const bitmapSrc = assets[currentAssetsMod.value.index].bitmapSrc
    bg.value = bitmapSrc.bg
    bitmaps.value = await Promise.all(bitmapSrc.bitmaps.map((src) => loadBitmapFromUrl(src)))
    blowBitmaps.value = await Promise.all(bitmapSrc.blowBitmaps.map((src) => loadBitmapFromUrl(src)))
    loaded = true
  }

  return { bg, bitmaps, blowBitmaps, loadBitmaps, currentAssetsMod }
})
