<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRafFn } from '@vueuse/core'

const props = defineProps({
  objects: Array,
  width: Number,
  height: Number,
})

const mainCanvas = ref(null)
const mainContext = computed(() => mainCanvas.value.getContext('2d'))

const bg = new Image()
bg.src = '/img/img_bg_level_3.jpg'
let bg1y = -props.height
let bg2y = 0

const draw = () => {
  mainContext.value.clearRect(0, 0, props.width, props.height)
  mainContext.value.drawImage(bg, 0, bg1y, props.width, props.height)
  mainContext.value.drawImage(bg, 0, bg2y, props.width, props.height)
  // 渲染
  for (const obj of props.objects) {
    try {
      mainContext.value.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h)
    } catch (e) {
      console.error(e, obj)
    }
  }
  bg1y++
  bg2y++
  if (bg1y >= props.height) bg1y = -props.height
  if (bg2y >= props.height) bg2y = -props.height
}

onMounted(() => useRafFn(draw, {immediate: true}))

</script>

<template>
  <canvas ref="mainCanvas" :width="width" :height="height" class="game-canvas"></canvas>
</template>

<style scoped>

</style>
