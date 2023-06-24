import { useSound } from '@vueuse/sound'
import bgmSound from '../assets/sounds/bgm.ogg'
import bulletSound from '../assets/sounds/bullet.mp3'
import endSound from '../assets/sounds/end.mp3'
import enemyHitSound from '../assets/sounds/enemy_hit.mp3'
import enemy2DownSound from '../assets/sounds/enemy2_down.mp3'
import enemy3DownSound from '../assets/sounds/enemy3_down.mp3'
import playerSkill2Sound from '../assets/sounds/player_skill_2.mp3'
import playerSkill0Sound from '../assets/sounds/player_skill_0.mp3'
import playerSkill1Sound from '../assets/sounds/player_skill_1.mp3'
import playerTreatSound from '../assets/sounds/player_treat.mp3'
import playerSkill3Sound from '../assets/sounds/player_skill_3.mp3'
import lvUpSound from '../assets/sounds/lv_up.mp3'

export default function () {
  const volume = 0.5
  const bgmAudio = new Audio(bgmSound)
  bgmAudio.volume = 0.5
  bgmAudio.loop = true
  return {
    bgm: () => bgmAudio.play(),
    bullet: useSound(bulletSound, {volume}).play,
    end: useSound(endSound, {volume}).play,
    enemyHit: useSound(enemyHitSound, {volume}).play,
    enemy2Down: useSound(enemy2DownSound, {volume}).play,
    enemy3Down: useSound(enemy3DownSound, {volume}).play,
    playerSkill2: useSound(playerSkill2Sound, {volume}).play,
    playerSkill0: useSound(playerSkill0Sound, {volume}).play,
    playerSkill1: useSound(playerSkill1Sound, {volume}).play,
    playerTreat: useSound(playerTreatSound, {volume}).play,
    playerSkill3: useSound(playerSkill3Sound, {volume}).play,
    lvUp: useSound(lvUpSound, {volume}).play,
  }
}
