<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>
      <q-toolbar-title :padding="1">
        Wondrous-Badí' Calendar Tools
      </q-toolbar-title>
    </div>
    <div slot="header" class="toolbar">
      <q-toolbar-title slot="header" :padding="1">
        17 Questions 173
      </q-toolbar-title>
    </div>
    <q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title :padding="1">
          Pages
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimiter">
        <q-drawer-link v-for="page in pages" :to="page.to">{{page.text}}
        </q-drawer-link>
      </div>
    </q-drawer>
    <router-view class="layout-view"></router-view>
    <div slot="footer" class="toolbar">
      <div class="auto flex justify-center within-iframe-hide">
        <button v-go-back="'/'">
          <i class="on-left animate-blink">
            replay
          </i>
          Home
        </button>
      </div>
      <q-toolbar-title :padding="0" class="within-iframe-only">
        Footer
      </q-toolbar-title>
    </div>
  </q-layout>
</template>
<script>
  import routeList from './routes'

  export default {
    data() {
      return {
        pages: routeList.menuPages,
        search: ''
      }
    },
    head: {
      // To use "this" in the component, it is necessary to return the object through a function
      title: function () {
        return {
          inner: 'Hello?' //this.title
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
<style></style>
