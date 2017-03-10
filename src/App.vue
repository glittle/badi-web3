<template>
  <q-layout itemscope itemtype="http://schema.org/SoftwareApplication">
    <div slot="header" class="toolbar">
      <q-toolbar-title>
        <h1 itemprop="name">Wondrous-Badí' Today</h1>
        <h2 v-show="setupDone" v-html="topDate"></h2>
      </q-toolbar-title>
    </div>
    <keep-alive>
      <router-view v-touch-swipe.horizontal.scroll="swipePage" class="layout-view q-touch-x"></router-view>
    </keep-alive>
    <div slot="footer" class="toolbar">
      <div v-link.replace="page.to" :title="page.text" class="tbLink" v-for="page in pages.filter(p=>p.group.includes('main'))">
        <img class="tbIcon" :src="page.icon" :alt="page.text"></span>
        <span v-html="page.text"></span>
      </div>
      <button ref="target" class="primary">
        <i>more_vert</i>
        <q-popover ref="popover">
           <div class="list">
            <div class="item item-link" v-for="page in pages.filter(p=>p.group.includes('setup'))" @click="$refs.popover.close()">
              <div>
                <q-drawer-link :icon="page.icon" :to="page.to" >{{page.text}}</q-drawer-link>
              </div>
            </div>
            <div class=version>Version {{version}}</div>
          </div>
      </q-popover>
      </button>
    </div>
  </q-layout>
</template>
<script src="app.vue.js"></script>
<style src="App.vue.css"></style>
