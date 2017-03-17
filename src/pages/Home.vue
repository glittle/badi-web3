<template>
  <article class="layout-padding tightTop">
    
    <div class="card">
      <div class="heading">
        <span class="desc" v-html="sunDisplay"></span>
        <span class="type">…in this Day</span>
      </div>
      <div id="sunChart"></div>
    </div>
    <div class="card">
      <Grid19 v-bind:info="info('month')"></Grid19>
    </div>
    <div class="card">
      <Grid19 v-bind:info="info('year')"></Grid19>
    </div>
    <div class="card">
      <Grid19 v-bind:info="info('vahid')"></Grid19>
    </div>
    <div class="card">
      <Grid19 v-bind:info="info('kull')"></Grid19>
    </div>
    <div class="card" v-on:click="$router.push('verse')">
      <div class="heading">
        <span class="type">Verse</span>
      </div>
      <Verse></Verse>
    </div>
    <div class="card tap95card">
     <div class="heading">
        <span class="type">95 Alláh-u-Abhás</span>
        <span>
        <label><input type=checkbox v-model="tapSounds">Sounds</label>
        <button 
          v-on:click="reset95"
          class="reset small light round raised">Reset</button> </span>
      </div>
      <div class="main95">
        <button 
        v-on:click="tap95"
        v-bind:disabled="tapNum == 95"
        class="primary circular big"
        >Tap Me</button>
        <div>
          <span class=tapNum v-html="tapNum"></span>
          <div id=tapBlocks></div>
        </div>
      </div>
    </div>
    <audio id="tapSound1" src="/statics/371753__problematist__dhumm2.ogg" autostart="false" ></audio>
    <audio id="tapSound2" src="/statics/230157__akshaylaya__bheem-e-022.wav" autostart="false" ></audio>
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
    </div>
  </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
