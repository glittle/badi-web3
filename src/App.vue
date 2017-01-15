<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <!--<button class="hide-on-drawer-visible" @click="$refs.leftDrawer.open()">
        <i>menu</i>
      </button>-->
      <q-toolbar-title>
        <h1>Wondrous-Badí' Calendar</h1>
        <h2 v-html="topDate"></h2>
      </q-toolbar-title>
      <!--<button ref="target" class="primary">
        <i>more_vert</i>
        <q-popover ref="popover">
           <div class="list">
            <div class="item item-link" v-for="page in pages.filter(p=>p.group.includes('setup'))" @click="$refs.popover.close()">
              <q-drawer-link :icon="page.icon" :to="page.to" >{{page.text}}</q-drawer-link>
            </div>
          </div>
      </q-popover>
      </button>-->
    </div>
    <!--<q-drawer ref="leftDrawer">
      <div class="toolbar light">
        <q-toolbar-title>
          Pages
        </q-toolbar-title>
      </div>
      <div class="list no-border platform-delimiter">
        <q-drawer-link v-for="page in pages" :class="'menu-' + page.group.toString().replace(/,/g,'_')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
      </div>
    </q-drawer>-->
    <keep-alive>
      <router-view v-touch-swipe.horizontal.scroll="swipePage" class="layout-view q-touch-x"></router-view>
    </keep-alive>
    <div slot="footer" class="toolbar">
      <div v-link.replace="page.to" :title="page.text" class="tbLink" v-for="page in pages.filter(p=>!p.group.includes('setup'))">
        <img class="tbIcon" :src="page.icon" :alt="page.text"></span>
        <span v-html="page.text"></span>
      </div>
      <!--<router-link tag="button" class="item item-link" :class="'icon_' + page.group" v-for="page in pages.filter(p=>!p.group.includes('setup'))"
        :to="page.to">
        <i :title="page.text">{{page.icon}}</i>
      </router-link>-->
      <button ref="target" class="primary">
        <i>more_vert</i>
        <q-popover ref="popover">
        <!--<div class="list no-border platform-delimiter">
          <q-drawer-link v-for="page in pages.filter(p=>p.group.includes('setup'))" :icon="page.icon" :to="page.to" @click="$refs.popover.close()">{{page.text}}</q-drawer-link>-->
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
<script>
  import {
    Toast
  } from 'quasar'

  import routeList from './pages/routes'
  import badiCalc from './scripts/badiCalc'
  import * as notify from './scripts/notification'
  import * as shared from './scripts/shared'
  const moment = require('moment-timezone');
  var versionInfo = require('../root/version.json')

  require('./scripts/stringExt')

  export default {
    data() {
      return {
        pages: routeList.menuPages,
        di: badiCalc.di
      }
    },
    computed: {
      topDate: function () {
        return shared.formats.topTitle.filledWith(this.di)
      },
      version() {
        var age = moment(versionInfo.buildDate, "_ MMM D YYYY HH:mm:ss _Z").fromNow();
        return '{0} ({1})'.filledWith(versionInfo.version, age)
      }

    },
    created() {
      document.addEventListener('pulsed', this.doWorkOnPulse, false)
    },
    methods: {
      doWorkOnPulse() {
        // console.log('app pulse')
          // notification icon
        var di = badiCalc.di;
        var key = di.stamp;
        if (key !== lastNotificationKey) {
          // console.log('do notify')
          this.di = di;
          notify.showNow();
          lastNotificationKey = key;
        }
      },
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

  function checkLocation(vue) {
    var src = shared.coords.source;
    var c = +shared.coords.lat + +shared.coords.lng;
    var okay = c !== 0 && src !== 'default';

    if (!okay) {
      Toast.create.negative({
        html: 'Location must be set for dates and times to be correct!',
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
