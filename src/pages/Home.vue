<template>
  <article class="layout-padding">
    <div class="card">
      <div class="card-content" v-html="dayDisplay"></div>
    </div>
    <div class="card">
      <div class="card-content sunDisplay" v-html="sunDisplay"></div>
      <div class="card-content">
        <div>Sun times in <span v-html="location"></span> for <span v-html="shortDay"></span><span>:</span></div>
      </div>
      <div id="sunChart"></div>
    </div>
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
