<template>
  <article class="layout-padding tightTop Home">
    <div v-if="!setupDone"
         class="card">
      <div class="locationHolder">
        <location-setup></location-setup>
      </div>
    </div>
  
    <div class="card">
      <div class="heading">
        <span class="desc">
              <span v-html="sunDisplay"></span>
        <span v-html="location"
              class="bold"></span>
              <i class="clickable" v-on:click="changeLocation">autorenew</i>
        </span>
        <span class="type">…in this Day</span>
      </div>
      <div id="sunChart"></div>
      <Grid19 v-bind:info="info('month')"></Grid19>
      <Grid19 v-bind:info="info('year')"></Grid19>
      <Grid19 v-bind:info="info('vahid')"></Grid19>
      <Grid19 v-bind:info="info('kull')"></Grid19>
    </div>
    <div class="card verse">
      <div class="heading">
        <span class="desc"
              v-html="verseTime"></span>
        <span>
                <button 
                  v-on:click="$router.push('verse')"
                  class="small light round">More</button> 
              </span>
      </div>
      <Verse v-bind:toggleVerseSpeech="toggleVerseSpeech"></Verse>
    </div>
    <div class="card tap95card">
      <div class="heading">
        <span class="desc">95 Alláh-u-Abhás</span>
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
        <span class="desc">Upcoming Dates</span>
        <span>
                                <button 
                                  v-on:click="$router.push('listing')"
                                  class="small light round">More</button> 
                              </span>
      </div>
      <listing :onHome="true"></listing>
    </div>
  
    <div class="card share">
      <div class="heading">
        <span class="desc">Share and Support</span>
        <span>
                                                      <button 
                                                        v-on:click="$router.push('about')"
                                                        class="small light round">About</button> 
                                                    </span>
      </div>
      <div class="support">
        <img class="qr"
             src="~statics/qr.png">
        <p>
          Share this site (https://wondrous-badi.today) with a friend! See the "About" page to support the developer and send suggestions! For more calendar tools, get the <a href="https://sites.google.com/site/badicalendartools/home/web-extension"
             rel="noopener"
             target='sites'>Badí' Calendar</a> web extension for Chrome (desktop only).
        </p>
      </div>
    </div>

  </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
