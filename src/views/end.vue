<script setup>
import { ref } from 'vue'
import { useLogStore } from '@/stores/log-store'

const logStore = useLogStore()

const loading = ref(false)
const restart = () => location.reload()

</script>

<template>
  <div class="end-frame">
    <h1 class="end-title">游戏结束</h1>
    <h1 class="end-title">分数:{{ logStore.score }}</h1>
    <p v-if="loading">加载中...</p>
    <button class="end-btn" @click="restart" v-else>重新开始</button>
    <a class="link" href="https://github.com/FlapyPan/plane-war-vue">项目 Github 地址</a>
  </div>
</template>

<style scoped lang="postcss">
.end-frame {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url(/img/bg_welcome.webp) no-repeat center;
  background-size: cover;

  .end-title {
    font-size: 48px;
    color: red;
    line-height: 80px;
  }

  .end-btn {
    border: none;
    padding: 10px 15px;
    font-size: 28px;
    color: #333;
    cursor: pointer;
  }

  .link {
    margin-top: 20px;
  }
}

</style>
