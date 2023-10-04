import { useSound } from '@vueuse/sound'
import assets from '@/game/assets'
import { useLocalStorage } from '@vueuse/core'

export default function () {
  const currentAssetsMod = useLocalStorage('assets-mod', { index: 0 })
  const audioSrc = assets[currentAssetsMod.value.index].audioSrc
  const bgm = new Audio(audioSrc.bgm)
  bgm.volume = 0.6
  bgm.loop = true
  const start = new Audio(audioSrc.start)
  start.loop = false
  const sounds = {}
  for (const key in audioSrc) {
    const options = { volume: 0.5 }
    sounds[key] = useSound(audioSrc[key], options).play
  }

  return {
    ...sounds,
    bgm: () => bgm.play(),
    start: () => start.play(),
  }
}
