<template>
  <article class="layout-padding tightTop">
    
    <div class="card">
      <div class="heading">
        <span class="type">Time</span>
        <span class="desc" v-html="sunDisplay"></span>
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
    <div class="card">
      <Grid19 v-bind:info="info('kull2')"></Grid19>
    </div>
    <div class="card" v-on:click="$router.push('verse')">
      <div class="heading">
        <span class="type">Verse</span>
      </div>
      <Verse></Verse>
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
