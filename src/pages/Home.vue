<template>
  <article class="layout-padding">
    <div class="card">
      <div class="card-content" v-html="dayDisplay"></div>
    </div>
    <div class="card">
      <div id="sunChart"></div>
      <div class="card-content" v-html="sunDisplay"></div>
    </div>
    <div class="card">
      <div class="card-content">
        <p>Temporary page list...</p>
        <div class="list no-border">
          <router-link tag="button" class="item item-link" :class="'icon_' + page.group" v-for="page in pageList.filter(p=>p.to!=='Home')"
            :to="page.to">
            <i :title="page.text">{{page.icon}}</i>
          </router-link>
        </div>
        <p>{{version}}</p>
      </div>
    </div>
  </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
