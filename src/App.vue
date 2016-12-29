<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>
      <q-toolbar-title>
        <h1>Wondrous-Badí' Calendar Tools</h1>
        <h2>{{topDate}}</h2>
      </q-toolbar-title>
      <router-link to="/">
        <button class="push small">
                        <i class="on-right">home</i>
            </button>
      </router-link>
    </div>
    <q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title>
          Pages
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimiter">
        <q-drawer-link v-for="page in pages" :to="page.to">{{page.text}}</q-drawer-link>
      </div>
    </q-drawer>
    <router-view class="layout-view"></router-view>
  </q-layout>
</template>
<script>
  import routeList from './pages/routes'

  export default {
    data() {
      return {
        pages: routeList.menuPages,
        topDate: '18 Questions 173'
      }
    },
    head: {
      title: function () {
        return {
          inner: 'Home',
          separator: '-'
        }
      },
      meta: [{
        name: 'description2',
        content: 'My description',
        //id: 'desc'
      }, {
        itemprop: 'name',
        content: 'Content Title'
      }]
    }
  }

</script>
<style src="App.vue.css"></style>
