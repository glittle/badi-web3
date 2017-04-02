<template>
  <article class="layout-padding tightTop">
  
    <div class="card">
      <div class="heading">
        <span class="desc"
              v-html="sunDisplay"></span>
      </div>
      <div id="sunChart"></div>
      <Grid19 v-bind:info="info('month')"></Grid19>
      <Grid19 v-bind:info="info('year')"></Grid19>
      <Grid19 v-bind:info="info('vahid')"></Grid19>
      <Grid19 v-bind:info="info('kull')"></Grid19>
    </div>
    <div class="card verse">
      <div class="heading">
        <span class="type"
              v-html="verseTime"></span>
        <span>
                          <button 
                            v-on:click="$router.push('verse')"
                            class="small light round">More</button> 
                        </span>
      </div>
      <Verse></Verse>
    </div>
    <div class="card tap95card">
      <div class="heading">
        <span class="type">95 Alláh-u-Abhás</span>
        <span>
                          <label><input type=checkbox v-model="tapAuto">Auto</label>
                          <label><input type=checkbox v-model="tapSounds">Sound</label>
                          <button 
                            v-on:click="reset95"
                            class="reset small light round">Reset</button> 
                            
                </span>
      </div>
      <div class="main95">
        <div>
          <span class=tapNum
                v-html="tapNum"></span>
          <div id="tapBlocks"></div>
          <div class="tapDelayArea"
               v-bind:style="{opacity: tapAuto ? 1 : 0.25}">
            <span>Auto</span>
            <q-range v-model="tapAutoDelay"
                     :step="500"
                     :min="1000"
                     :max="9000"></q-range>
            <span v-html="(Math.round(tapAutoDelay/100)/10).toFixed(1) + ' s'"></span>
          </div>
        </div>
        <button v-on:click="tap95"
                v-bind:disabled="tapNum == 95"
                v-html="tapBtnText"
                title="Tap here. In Auto mode, tap to Start or Stop"
                class="primary circular big"></button>
      </div>
    </div>
    <audio id="tapSoundForSteps"
           src="/statics/gong2.mp3"
           autostart="false"></audio>
    <audio id="tapSoundForSteps19"
           src="/statics/gong2b.mp3"
           autostart="false"></audio>
    <audio id="tapSoundForEnd"
           src="/statics/gong1.mp3"
           autostart="false"></audio>
    <!--<div class="card">
                      <div class="card-content">
                        <p>Temporary page list...</p>
                        <div class="list no-border">
                          <router-link tag="button" class="item item-link" :class="'icon_' + page.group" v-for="page in pageList.filter(p=>p.to!=='Home')"
                            :to="page.to">
                            <i :title="page.text">{{page.icon}}</i>
                          </router-link>
                        </div>
                      </div>-->
    <div class="card share">
      <div class="heading">
        <span class="type">Share and Support</span>
        <span>
                          <button 
                            v-on:click="$router.push('about')"
                            class="small light round">About</button> 
                        </span>
      </div>
      <div class="support">
        <img class="qr" src="~statics/qr.png">
        <p>
          Share this QR code with a friend! 
          To show your appreciation and support the developer, see the "About" page.
        </p>
      </div>
    </div>
  </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
