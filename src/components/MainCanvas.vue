<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRafFn } from '@vueuse/core'
import { useBitmapStore } from '@/stores/bitmap-store'

const props = defineProps({
  objects: Array,
  width: Number,
  height: Number,
})

const bitmapStore = useBitmapStore()

const mainCanvas = ref(null)
const mainContext = computed(() => mainCanvas.value.getContext('2d'))

let bg = new Image()
onMounted(() => {
  bg.src = bitmapStore.bg
})
let bg1y = -props.height
let bg2y = 0

const draw = () => {
  mainContext.value.clearRect(0, 0, props.width, props.height)
  mainContext.value.drawImage(bg, 0, bg1y, props.width, props.height)
  mainContext.value.drawImage(bg, 0, bg2y, props.width, props.height)
  // 渲染
  for (const obj of props.objects) {
    try {
      mainContext.value.drawImage(obj.img, Math.floor(obj.x), Math.floor(obj.y), obj.w, obj.h)
    } catch (e) {
      console.error(e, obj)
    }
  }
  bg1y++
  bg2y++
  if (bg1y >= props.height) bg1y = -props.height
  if (bg2y >= props.height) bg2y = -props.height
}

onMounted(() => useRafFn(draw, { immediate: true }))

</script>

<template>
  <canvas ref="mainCanvas" :width="width" :height="height" class="game-canvas"></canvas>
</template>

<style scoped>

</style>
