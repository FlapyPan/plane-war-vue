<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useEventListener, useFps, useIntervalFn, useMouseInElement, useRafFn, useWindowSize } from '@vueuse/core'
import { useLogStore } from '@/stores/log-store'
import { useBitmapStore } from '@/stores/bitmap-store'
import { AnimeGameObject, GameObject, MovableGameObject } from '@/game/type'
import { distanceBetweenPoints, isColliding } from '@/game/utils'
import circlePoints from '@/game/circle-points'
import MainCanvas from '@/components/MainCanvas.vue'
import router from '@/router'
import useGameAudio from '@/hooks/useGameAudio'

const logStore = useLogStore()
const bitmapStore = useBitmapStore()
const gameAudio = useGameAudio()

if (!logStore.loaded) {
  router.replace('/')
}

const clickTarget = ref(null)
const { width: _globalWidth, height: _globalHeight } = useWindowSize()
const globalHeight = computed(() => Math.min(_globalHeight.value, 714))
const globalWidth = computed(() => Math.min(_globalWidth.value, globalHeight.value))

/** @const 主窗口class */
const mainFrameClass = computed(() => ({
  'hurt': playerHurt.value,
  'treat': playerTreat.value,
  'skill-0': playerSkill[0].releasing,
  'skill-1': playerSkill[1].releasing,
}))

// 分数置零
logStore.score = 0
// 玩家相关信息
const playerMaxBlood = ref(25)
const playerBullet = {
  defaultW: 10,
  defaultH: 15,
  defaultSpeedX: 0,
  defaultSpeedY: -12,
}
const fps = useFps()
const tik = computed(() => 60 / fps.value)
// 敌机相关信息
const enemyInfo = {
  enemyDefaultW: 50,
  enemyDefaultH: 60,
  enemyBlood: 8,
  enemyDamage: 1,
  enemyMaxCount: 5,
  enemyMaxSpeedX: 3,
  enemyMaxSpeedY: 3,
}
const enemyBullet = {
  defaultW: 12,
  defaultH: 18,
  defaultSpeedX: 0,
  defaultSpeedY: 4,
}

/** 监听玩家分数，提高难度 */
watch(() => logStore.score, (newValue, oldValue) => {
  const newLv = Math.floor(newValue / 50)
  const oldLv = Math.floor(oldValue / 50)
  if (newLv > oldLv) {
    logStore.logger.info('难度提高，当前为：' + newLv)
    player.damage += 1
    playerMaxBlood.value += 1
    const newBlood = player.blood + 1
    if (playerMaxBlood.value >= newBlood) {
      player.blood = newBlood
    }
    enemyInfo.enemyMaxCount += 10
    enemyInfo.enemyBlood += 1
    enemyInfo.enemyDamage += 1
    enemyInfo.enemyMaxSpeedX += 0.5
    enemyInfo.enemyMaxSpeedY += 0.5
    enemyBullet.defaultSpeedY += 0.5
    gameAudio.lvUp()
  }
})

/** 玩家 */
const player = reactive(new GameObject(
  bitmapStore.bitmaps[0],
  (globalWidth.value - 75) / 2, globalHeight.value - 100, 75, 55,
  playerMaxBlood.value,
  2,
))
/** 玩家发射的子弹 */
const playerBullets = reactive([])
/** 敌机 */
const enemies = reactive([])
/** 敌机发射的子弹 */
const enemyBullets = reactive([])
/** 爆炸效果 */
const blows = reactive([])

const objects = computed(() => [
  player,
  ...playerBullets,
  ...enemies,
  ...enemyBullets,
  ...blows,
])

/** 敌机生成 */
const {
  pause: pauseGenerateEnemy,
  resume: resumeGenerateEnemy,
} = useIntervalFn(() => {
  // 限制敌机数量
  if (enemies.length >= enemyInfo.enemyMaxCount) return
  // 随机获取生成模式,这里为3个模式
  const mode = Math.floor(Math.random() * 3)
  if (mode === 1) { // 敌机从屏幕左侧进入
    enemies.push(new MovableGameObject(
      bitmapStore.bitmaps[2],
      -enemyInfo.enemyDefaultW, Math.random() * (100 - enemyInfo.enemyDefaultH),
      enemyInfo.enemyDefaultW, enemyInfo.enemyDefaultH,
      Math.ceil(Math.random() * enemyInfo.enemyMaxSpeedX) * tik.value,
      Math.ceil(Math.random() * enemyInfo.enemyMaxSpeedY) * tik.value,
      enemyInfo.enemyBlood,
      enemyInfo.enemyDamage,
    ))
  } else if (mode === 2) { // 敌机从屏幕右侧进入
    enemies.push(new MovableGameObject(
      bitmapStore.bitmaps[2],
      globalWidth.value + enemyInfo.enemyDefaultW, Math.random() * (100 - enemyInfo.enemyDefaultH),
      enemyInfo.enemyDefaultW, enemyInfo.enemyDefaultH,
      -Math.ceil(Math.random() * enemyInfo.enemyMaxSpeedX) * tik.value,
      Math.ceil(Math.random() * enemyInfo.enemyMaxSpeedY) * tik.value,
      enemyInfo.enemyBlood,
      enemyInfo.enemyDamage,
    ))
  } else { //敌机从屏幕上方进入
    enemies.push(new MovableGameObject(
      bitmapStore.bitmaps[2],
      Math.random() * (globalWidth.value - enemyInfo.enemyDefaultW), -enemyInfo.enemyDefaultH,
      enemyInfo.enemyDefaultW, enemyInfo.enemyDefaultH,
      0,
      Math.ceil(Math.random() * enemyInfo.enemyMaxSpeedY + 1) * tik.value,
      enemyInfo.enemyBlood,
      enemyInfo.enemyDamage,
    ))
  }
}, 120, { immediate: true })

/**@function 玩家技能冷却图标
 * @param {number} code 技能代号
 **/
const playerSkillLogo = (code) => {
  const skill = playerSkill[code]
  const now = skill.nowCD
  if (now === 0) return skill.name + skill.key
  return `${skill.name}${now > 1000 ? Math.ceil(now / 1000) : now / 1000}`
}

/** 玩家开火 */
const {
  resume: resumePlayerFire,
} = useIntervalFn(() => {
  const bw = playerBullet.defaultW
  const bh = playerBullet.defaultH
  const sx = playerBullet.defaultSpeedX
  const sy = playerBullet.defaultSpeedY
  const { x, y, w, damage } = player
  playerBullets.push(
    new MovableGameObject(
      bitmapStore.bitmaps[1],
      x + w / 2 - bw / 2, y,
      bw, bh,
      0, sy * tik.value,
      1, damage,
    ),
    new MovableGameObject(
      bitmapStore.bitmaps[1],
      x + bw, y + bh,
      bw, bh,
      -sx * tik.value, sy * tik.value,
      1, damage,
    ),
    new MovableGameObject(
      bitmapStore.bitmaps[1],
      x + w - bw * 2, y + bh,
      bw, bh,
      sx * tik.value, sy * tik.value,
      1, damage,
    ),
  )
  gameAudio.bullet()
}, 125, { immediate: true })

// 计算玩家子弹碰撞
const {
  pause: pauseCalcPlayerBullets,
  resume: resumeCalcPlayerBullets,
} = useRafFn(() => {
  // 玩家子弹
  for (let i = 0; i < playerBullets.length; i++) {
    const b = playerBullets[i]
    // 判断是否超出绘画范围
    if (!b.isAlive || !b.move(globalWidth.value, globalHeight.value)) {
      playerBullets.splice(i, 1)
      i--
    } else {
      const hitIndex = enemies.findIndex((e) => {
        if (!e.isAlive) return false
        // 获取子弹坐标中心点
        const bX = b.x + b.w / 2
        const bY = b.y + b.h / 2
        // 判断是否在敌机坐标范围
        return isColliding(bX, bY, e)
      })
      if (hitIndex < 0) continue
      b.collide(enemies[hitIndex])
    }
  }
}, { immediate: true })

/** 敌机开火 */
const {
  pause: pauseEnemiesFire,
  resume: resumeEnemiesFire,
} = useIntervalFn(() => {
  for (const e of enemies) {
    if (Math.random() < 0.9) continue
    enemyBullets.push(new MovableGameObject(
      bitmapStore.bitmaps[3],
      e.x + (e.w - enemyBullet.defaultW) / 2, e.y + e.h,
      enemyBullet.defaultW, enemyBullet.defaultH,
      enemyBullet.defaultSpeedX * tik.value,
      e.speedY < 3
        ? enemyBullet.defaultSpeedY * tik.value
        : e.speedY * tik.value,
      1, e.damage,
    ))
  }
}, 200, { immediate: true })

/**  计算敌机子弹碰撞 */
const {
  pause: pauseCalcEnemyBullets,
  resume: resumeCalcEnemyBullets,
} = useRafFn(() => {
  for (let i = 0; i < enemyBullets.length; i++) {
    const b = enemyBullets[i]
    // 判断是否超出绘画范围
    if (!b.isAlive || !b.move(globalWidth.value, globalHeight.value)) {
      enemyBullets.splice(i, 1)
      i--
    } else {
      // 判断是否击中玩家
      // 获取子弹坐标中心点
      const bX = b.x + b.w / 2
      const bY = b.y + b.h / 2
      if (isColliding(bX, bY, player)) {
        b.collide(player)
        gameAudio.enemyHit()
      }
    }
  }
}, { immediate: true })

/** 计算敌机碰撞 */
const {
  pause: pauseCalcEnemies,
  resume: resumeCalcEnemies,
} = useRafFn(() => {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i]
    if (!e.isAlive) {
      blows.push(new AnimeGameObject(bitmapStore.blowBitmaps, e.x, e.y, e.w, e.h))
      enemies.splice(i, 1)
      // 被击落加分
      logStore.score += 1
      i--
      gameAudio.enemyDown()
    } else if (!e.move(globalWidth.value, globalHeight.value)) {
      enemies.splice(i, 1)
      i--
    } else {
      // 判断是否击中玩家
      // 获取敌机坐标中心点
      const eX = e.x + e.w / 2
      const eY = e.y + e.h / 2
      if (isColliding(eX, eY, player)) {
        e.collide(player)
      }
    }
  }
}, { immediate: true })

/** 爆炸效果 */
const {
  pause: pauseCalcBlows,
  resume: resumeCalcBlows,
} = useRafFn(() => {
  for (let i = 0; i < blows.length; i++) {
    const b = blows[i]
    if (b.drawOver) {
      blows.splice(i, 1)
      i--
    }
  }
}, { immediate: true })


// 玩家技能
const playerSkill = reactive([
  {
    name: '时停',
    duration: 3000,
    defaultCD: 20000,
    nowCD: 0,
    releasing: false,
    key: 'R',
    effect: () => {
      // 暂停时间
      gameAudio.playerSkill0()
      pauseCalcEnemies()
      pauseCalcPlayerBullets()
      pauseCalcBlows()
      pauseEnemiesFire()
      pauseGenerateEnemy()
      pauseCalcEnemyBullets()
      playerSkill[0].releasing = true
      playerSkill[0].nowCD = playerSkill[0].defaultCD
      if (playerSkill[1].releasing) {
        enemyBullets.splice(0, enemyBullets.length)
      }
      setTimeout(() => {
        resumeCalcEnemies()
        resumeCalcPlayerBullets()
        resumeCalcBlows()
        resumeEnemiesFire()
        resumeGenerateEnemy()
        resumeCalcEnemyBullets()
        playerSkill[0].releasing = false
      }, playerSkill[0].duration)
    },
  },
  {
    name: '狂暴',
    duration: 5000,
    defaultCD: 12000,
    nowCD: 0,
    releasing: false,
    key: 'E',
    effect: () => {
      //狂暴,提升攻击力，提高子弹发射速度，子弹散射，开启狂暴后其他技能有所提升
      gameAudio.playerSkill1()
      const oldSpeedX = playerBullet.defaultSpeedX
      const oldDamage = player.damage
      const oldW = playerBullet.defaultW
      const oldH = playerBullet.defaultH
      player.damage *= 2
      playerBullet.defaultSpeedX += 2
      playerBullet.defaultW *= 1.5
      playerBullet.defaultH *= 1.5
      playerSkill[1].releasing = true
      playerSkill[1].nowCD = playerSkill[1].defaultCD
      setTimeout(() => {
        playerBullet.defaultSpeedX = oldSpeedX
        player.damage = oldDamage
        playerBullet.defaultW = oldW
        playerBullet.defaultH = oldH
        playerSkill[1].releasing = false
      }, playerSkill[1].duration)
    },
  },
  {
    name: '治疗',
    duration: 3000,
    defaultCD: 18000,
    nowCD: 0,
    releasing: false,
    key: 'W',
    effect: () => {
      //治疗
      gameAudio.playerTreat()
      const time = playerSkill[1].releasing === true ? 250 : 500
      const it = setInterval(() => {
        if (player.blood <= 0 || player.blood >= playerMaxBlood.value) return
        player.blood += 2
      }, time)
      playerSkill[2].releasing = true
      playerSkill[2].nowCD =
        playerSkill[2].defaultCD
      setTimeout(() => {
        clearInterval(it)
        playerSkill[2].releasing = false
      }, playerSkill[2].duration)
    },
  },
  {
    name: '散射',
    duration: 1000,
    defaultCD: 8000,
    nowCD: 0,
    releasing: false,
    key: 'Q',
    effect: () => {
      //圆形散射
      gameAudio.playerSkill3()
      const bw = playerBullet.defaultW
      const bh = playerBullet.defaultH
      const time = playerSkill[1].releasing === true ? 75 : 100
      let i = 0
      const len = circlePoints.length
      const it = setInterval(() => {
        playerBullets.push(...circlePoints[i].map(({ x, y }) => new MovableGameObject(
          bitmapStore.bitmaps[1],
          player.x + (player.w - bw) / 2, player.y,
          bw, bh, x * tik.value, y * tik.value,
          1, player.damage,
        )))
        const nextI = i + 1
        i = nextI === len ? 0 : nextI
      }, time)
      playerSkill[3].releasing = true
      playerSkill[3].nowCD = playerSkill[3].defaultCD
      setTimeout(() => {
        clearInterval(it)
        playerSkill[3].releasing = false
      }, playerSkill[3].duration)
    },
  },
])

// 技能释放
const releasePlayerSkill = (code) => {
  if (player.blood <= 0) return
  if (playerSkill[code].releasing || playerSkill[code].nowCD > 0) return
  playerSkill[code].effect()
}

// 技能冷却
const {
  pause: pauseSkillCoolDown,
  resume: resumeSkillCoolDown,
} = useIntervalFn(() => {
  for (let i = 0; i < playerSkill.length; i++) {
    const skill = playerSkill[i]
    if (skill.nowCD > 0) {
      playerSkill[i].nowCD -= 100
    }
  }
}, 100, { immediate: true })

// 快捷键绑定
useEventListener(document, 'keypress', (event) => {
  const key = event.key.toLocaleUpperCase()
  // 绑定技能
  const skillIndex = playerSkill.findIndex((skill) => key === skill.key)
  if (skillIndex >= 0) releasePlayerSkill(skillIndex)
})

// 处理鼠标和触摸事件
let isClickDown = false
let useTouch = false
const { elementX, elementY, elementWidth, elementHeight, sourceType } = useMouseInElement(clickTarget)
const touchSize = Math.max(player.w, player.h) * 1.5
watch([elementX, elementY], ([x, y]) => {
  // 如果使用触摸，就把鼠标事件彻底禁用
  if (useTouch && sourceType.value === 'mouse') return
  // 如果使用鼠标，但没有按下就不移动
  if (sourceType.value === 'mouse' && !isClickDown) return
  // 使用触摸
  if (sourceType.value === 'touch') {
    useTouch = true
    // 判断滑动的位置是否有效
    if (distanceBetweenPoints(x, y, player.x, player.y) > touchSize) return
  }
  // 计算新的玩家位置
  if (x > 0 && x < elementWidth.value) player.x = x - player.w / 2
  if (y > 0 && y < elementHeight.value) player.y = y - player.h / 2
})

const playerHurt = ref(false)
const playerTreat = ref(false)
/** 监听玩家血量 */
watch(() => player.blood, (newValue, oldValue) => {
  if (newValue <= 0) {
    router.push('/end')
    gameAudio.end()
    return
  }
  if (newValue < oldValue) {
    // 治疗状态
    if (!playerHurt.value) {
      playerHurt.value = true
      setTimeout(() => playerHurt.value = false, 500)
      gameAudio.playerSkill2()
    }
  } else if (newValue > oldValue) {
    // 受伤状态
    if (!playerTreat.value) {
      playerTreat.value = true
      setTimeout(() => playerTreat.value = false, 500)
    }
  }
})

onMounted(() => {
  gameAudio.bgm()
  gameAudio.start()
})

</script>

<template>
  <div class="game-frame" :class="mainFrameClass"
       @click="isClickDown = !isClickDown"
       :style="`--globalWidth: ${globalWidth}px;--globalHeight: ${globalHeight}px;`"
  >
    <MainCanvas ref="clickTarget" :width="globalWidth" :height="globalHeight" :objects="objects" />
    <div class="game-info">
      <div class="skill-info">
        <div v-for="(skill,i) in playerSkill" @touchstart="releasePlayerSkill(i)"
             :class="{'skill-info-box':true,'cooldown':skill.nowCD!==0}">
          {{ playerSkillLogo(i) }}
        </div>
      </div>
      <div class="player-info">
        ♥&nbsp;{{ player.blood }}/{{ playerMaxBlood }}&nbsp;⚔&nbsp;{{ logStore.score }}
        <div class="g-container blood">
          <div class="g-progress" :style="{width:`${player.blood/playerMaxBlood*100}%`}">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.game-frame {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
  position: relative;
  will-change: transform, filter;
  transition: all 0.3s;

  canvas {
    height: 100%;
  }

  &.treat .blood .g-progress {
    background: linear-gradient(90deg, rgb(150, 191, 21), rgb(167, 255, 35)) !important;
  }

  &.hurt {
    filter: hue-rotate(-30deg) blur(1px);
  }

  &.skill-1 {
    filter: contrast(150%);
  }

  &.skill-0 {
    filter: grayscale(50%) brightness(80%);
  }

  .game-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    height: 50px;
    width: 100%;
    max-width: 715px;
    bottom: 0;
    left: auto;
    right: auto;

    .player-info {
      flex: 1;
      align-items: end;
      font-size: 14px;
      line-height: 24px;
      color: #fff;
      padding: 6px;

      .g-container {
        width: 100%;
        height: 8px;
        border-radius: 25px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.2);

        .g-progress {
          width: 50%;
          height: inherit;
          transition: width 0.3s linear;
        }

        &.blood .g-progress {
          background: linear-gradient(90deg, rgb(170, 0, 0), rgb(255, 35, 35));
        }
      }
    }

    .skill-info {
      display: flex;
      flex-direction: row-reverse;
      font-size: 14px;
      line-height: 24px;
      color: #fff;
      padding: 6px;

      .skill-info-box {
        color: #fff;
        font-size: 14px;
        height: 40px;
        padding: 6px 8px;
        border-radius: 4px;
        border: 3px solid green;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.3);
        cursor: pointer;

        &.cooldown {
          border: 3px solid #999;
        }
      }
    }
  }

}


</style>
