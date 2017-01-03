<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>
      <q-toolbar-title>
        <h1>Wondrous-Badí' Calendar</h1>
        <h2 v-html="topDate"></h2>
      </q-toolbar-title>
      <button ref="target" class="primary">
        <i>more_vert</i>
        <q-popover ref="popover">
        <!--<div class="list no-border platform-delimiter">
          <q-drawer-link v-for="page in pages.filter(p=>p.group.includes('setup'))" :icon="page.icon" :to="page.to" @click="$refs.popover.close()">{{page.text}}</q-drawer-link>-->
           <div class="list">
            <div class="item item-link" v-for="page in pages.filter(p=>p.group.includes('setup'))" @click="$refs.popover.close()">
              <q-drawer-link :icon="page.icon" :to="page.to" >{{page.text}}</q-drawer-link>
            </div>
          </div>
      </q-popover>
      </button>
    </div>
    <q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title>
          Pages
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimiter">
        <q-drawer-link v-for="page in pages" :class="'menu-' + page.group.toString().replace(/,/g,'_')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
      </div>
    </q-drawer>
    <transition>
      <router-view v-touch-swipe.horizontal.scroll="swipePage" class="layout-view q-touch-x"></router-view>
    </transition>
  </q-layout>
</template>
<script>
  import {
    Toast
  } from 'quasar'

  import routeList from './pages/routes'
  import badiCalc from './scripts/badiCalc'
  import * as notify from './scripts/notification'
  import * as shared from './scripts/shared'

  require('./scripts/stringExt')

  export default {
    data() {
      return {
        pages: routeList.menuPages,
      }
    },
    computed: {
      topDate: function () {
        this.$store.state.pulseNum // force this compute to update on every pulse
        doWorkOnPulse();
        return shared.formats.topTitle.filledWith(badiCalc.di)
      }
    },
    methods: {
      swipePage(obj) {
        // console.log(obj)
        var delta;
        var doNormalAction = false;
        switch (obj.direction) {
          case 'right':
            delta = -1;
            break;
          case 'left':
            delta = 1;
            break;
          default:
            return doNormalAction;
        }

        if (Math.abs(obj.distance.x) < 0.5 * screen.width) {
          // ignore if not a wide swipe!
          return doNormalAction;
        }

        var goto = routeList.getNext(delta, this.$router.currentRoute);
        if (goto) {
          this.$router.push(goto);
          return;
        }
        return doNormalAction;
      }
    },
    mounted() {
      checkLocation(this)
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
      }, {
        itemprop: 'name',
        content: 'Content Title'
      }]
    }
  }

  var lastNotificationKey = null;

  function doWorkOnPulse() {
    // console.log('app pulse')
    // notification icon
    var key = badiCalc.di.stamp;
    if (key !== lastNotificationKey) {
      // console.log('do notify')
      notify.showNow();
      lastNotificationKey = key;
    }
  }

  function checkLocation(vue) {
    var src = shared.coords.source;
    var c = +shared.coords.lat + +shared.coords.lng;
    var okay = c !== 0 && src !== 'default';

    if (!okay) {
      Toast.create.negative({
        html: 'Location must be set for dates to be correct.',
        timeout: 1e11, // very long
        button: {
          label: 'Fix Now',
          handler() {
            vue.$router.push('locationsetup')
          },
          onDismiss() {
            vue.$router.push('locationsetup')
          }
        }
      })
    }
  }

</script>
<style src="App.vue.css"></style>
