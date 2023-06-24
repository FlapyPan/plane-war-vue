<script setup>
import { ref } from 'vue'
import { useLogStore } from '@/stores/log-store'
import { useBitmapStore } from '@/stores/bitmap-store'
import router from '@/router'
import startSound from '../assets/sounds/start.mp3'

const logStore = useLogStore()
const bitmapStore = useBitmapStore()
const startAudio = new Audio(startSound)
startAudio.volume = 0.5

const loading = ref(false)
const start = async () => {
  loading.value = true
  logStore.logger.info('加载图片...')
  await bitmapStore.loadBitmaps()
  logStore.logger.info('所有资源加载完毕！')
  logStore.loaded = true
  await startAudio.play()
  return router.push('/play')
}

</script>

<template>
  <div class="start-frame">
    <h1 class="start-title">飞机大战</h1>
    <p>by FlapyPan</p>
    <p class="logger-info">{{ logStore.log }}</p>
    <div v-if="loading" class="start-btn">加载中...</div>
    <button v-else class="start-btn" @click="start">进入游戏</button>
    <ul class="introduction">
      <li>电脑玩家：鼠标单击画面后操控飞机，再次单击解除控制</li>
      <li>手机玩家：直接拖动飞机操控</li>
      <li>Q 散射：发射几圈环形子弹清除周围的敌人（狂暴效果：增强发射速度）</li>
      <li>W 治疗：持续治疗一段时间（狂暴效果：提高治疗量）</li>
      <li>E 狂暴：提高子弹伤害和射速，开启狂暴后开启其他技能有所加强</li>
      <li>R 时停，暂停时间，期间免疫伤害（狂暴效果：清除所有敌机子弹）</li>
    </ul>
    <a class="link" href="https://github.com/FlapyPan/plane-war-vue">项目 Github 地址</a>
  </div>
</template>

<style scoped lang="postcss">
.start-frame {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url(/img/img_bg_logo.jpg) no-repeat center;
  background-size: cover;

  .start-title {
    font-size: 48px;
    color: #333;
  }

  .start-btn {
    margin: 40px;
    border: none;
    padding: 10px 15px;
    font-size: 28px;
    color: #333;
    cursor: pointer;
    background: white;
  }

  .introduction {
    margin: 0 auto;
    list-style: none;
  }

  .logger-info {
    color: #666;
    font-size: 14px;
  }

  .link {
    margin-top: 20px;
  }
}
</style>
