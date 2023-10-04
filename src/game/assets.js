class AssetsMod {
  constructor(name, info) {
    this.name = name
    this.info = info
    this.#loadBitmapSrc()
    this.#loadAudioSrc()
  }

  #loadBitmapSrc() {
    const bg = new URL(`../assets/${this.name}/img/bg.webp`, import.meta.url).href
    const bitmaps = [
      new URL(`../assets/${this.name}/img/plane.webp`, import.meta.url),
      new URL(`../assets/${this.name}/img/bullet.webp`, import.meta.url),
      new URL(`../assets/${this.name}/img/eplane.webp`, import.meta.url),
      new URL(`../assets/${this.name}/img/ebullet.webp`, import.meta.url),
    ].map((url) => url.href)
    const blowBitmaps = Array.from(
      { length: 9 },
      (v, i) => new URL(`../assets/${this.name}/img/blow/${i + 1}.webp`, import.meta.url),
    ).map((url) => url.href)
    this.bitmapSrc = { bg, bitmaps, blowBitmaps }
  }

  #loadAudioSrc() {
    this.audioSrc = {
      bgm: new URL(`../assets/${this.name}/sounds/bgm.mp3`, import.meta.url).href,
      bullet: new URL(`../assets/${this.name}/sounds/bullet.mp3`, import.meta.url).href,
      end: new URL(`../assets/${this.name}/sounds/end.mp3`, import.meta.url).href,
      enemyHit: new URL(`../assets/${this.name}/sounds/enemy_hit.mp3`, import.meta.url).href,
      enemyDown: new URL(`../assets/${this.name}/sounds/enemy_down.mp3`, import.meta.url).href,
      playerSkill0: new URL(`../assets/${this.name}/sounds/player_skill_0.mp3`, import.meta.url).href,
      playerSkill1: new URL(`../assets/${this.name}/sounds/player_skill_1.mp3`, import.meta.url).href,
      playerSkill2: new URL(`../assets/${this.name}/sounds/player_skill_2.mp3`, import.meta.url).href,
      playerSkill3: new URL(`../assets/${this.name}/sounds/player_skill_3.mp3`, import.meta.url).href,
      playerTreat: new URL(`../assets/${this.name}/sounds/player_treat.mp3`, import.meta.url).href,
      lvUp: new URL(`../assets/${this.name}/sounds/lv_up.mp3`, import.meta.url).href,
      start: new URL(`../assets/${this.name}/sounds/start.mp3`, import.meta.url).href,
    }
  }

}

export default [
  new AssetsMod('aniki', '哲学♂'),
  new AssetsMod('24', '24号(仅BGM)'),
]
