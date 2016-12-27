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
    <q-toolbar-title slot="header" :padding="1">
      17 Questions 173
    </q-toolbar-title>
    <q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title :padding="1">
          Pages
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimiter">
        <q-drawer-link v-for="page in pages" :to="page.to">{{page.text}}
        </q-drawer-link>
        <!--<q-drawer-link icon="build" to="/showcase/layout/toolbar">
          Toolbar
        </q-drawer-link>
        <q-drawer-link icon="tab" to="/showcase/layout/tabs">
          Tabs
        </q-drawer-link>
        <q-drawer-link icon="compare_arrows" to="/showcase/layout/drawer">
          Layout Drawer
        </q-drawer-link>
      </div>-->
    </q-drawer>
    <router-view class="layout-view"></router-view>
    <div slot="footer" class="toolbar">
      <div class="auto flex justify-center within-iframe-hide">
        <button v-go-back="'/showcase'">
          <i class="on-left animate-blink">
            replay
          </i>
          Back to Showcase
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
    }
  }

</script>
<style></style>
