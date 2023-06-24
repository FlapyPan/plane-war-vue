import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLogStore = defineStore('log', () => {
  const loaded = ref(false)
  const score = ref(0)
  // 全局日志
  const logger = {
    info(msg) {
      console.info(msg)
      this.history.push({code: 0, msg})
    },
    err(msg) {
      console.error(msg)
      this.history.push({code: 1, msg})
    },
    history: [],
  }
  const log = computed(() => {
    if (logger.history.length === 0) return ''
    const latestLog = logger.history[logger.history.length - 1]
    const title = latestLog.code === 0 ? '信息' : '错误'
    return `${title}：${latestLog.msg}`
  })

  return {loaded, score, logger, log}
})
