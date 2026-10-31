<template>
  <q-layout :class="{ noHeader: $route.meta.hideHeader }" itemscope itemtype="http://schema.org/SoftwareApplication">
    <template #header>
      <div class="toolbar" v-if="!$route.meta.hideHeader">
        <q-toolbar-title>
          <p class="appName" itemprop="name">Wondrous-Badíʿ Today</p>
          <p class="topDate" v-show="setupDone" v-html="topDate"></p>
        </q-toolbar-title>
      </div>
    </template>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component
          :is="Component"
          :key="$route.name"
          class="layout-view q-touch-x"
          v-touch-swipe.horizontal.scroll="swipePage"
        />
      </keep-alive>
    </router-view>
    <template #footer>
      <nav class="toolbar" :aria-label="$msg('a11yMainNav')">
        <router-link
          v-for="page in pages.filter(p => p.group.includes('main'))"
          :key="page.name"
          :to="pagePath(page)"
          replace
          class="tbLink"
          :class="{ active: routeName == page.name }"
          :aria-current="routeName == page.name ? 'page' : null"
        >
          <img class="tbIcon" :src="page.icon" alt="">
          <span v-html="page.text"></span>
        </router-link>
        <button ref="target" type="button" class="primary" :aria-label="$msg('a11yMoreMenu')">
          <i aria-hidden="true">more_vert</i>
          <q-popover ref="popover" :label="$msg('a11yMoreMenu')">
            <div class="list">
            <ul class="menuLinks">
              <li
                class="item item-link"
                v-for="page in pages.filter(p => p.group.includes('setup'))"
                :key="page.name"
                @click="$refs.popover.close()"
              >
                <div>
                  <q-drawer-link :icon="page.icon" :to="page.to">{{ page.text }}</q-drawer-link>
                </div>
              </li>
            </ul>
            <div class="version">Version {{ version }}</div>
            </div>
          </q-popover>
        </button>
      </nav>
    </template>
  </q-layout>
</template>
<script src="./App.vue.js"></script>
<style src="./App.vue.css"></style>
