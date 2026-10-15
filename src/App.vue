<template>
  <q-layout itemscope itemtype="http://schema.org/SoftwareApplication">
    <template #header>
      <div class="toolbar">
        <q-toolbar-title>
          <h1 itemprop="name">Wondrous-Badíʿ Today</h1>
          <h2 v-show="setupDone" v-html="topDate"></h2>
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
      <div class="toolbar">
        <div
          v-for="page in pages.filter(p => p.group.includes('main'))"
          :key="page.name"
          :title="page.text"
          class="tbLink"
          :class="{ active: routeName == page.name }"
          @click="openPage(page)"
        >
          <img class="tbIcon" :src="page.icon" :alt="page.text">
          <span v-html="page.text"></span>
        </div>
        <button ref="target" type="button" class="primary" aria-label="More">
          <i>more_vert</i>
          <q-popover ref="popover">
            <div class="list">
              <div
                class="item item-link"
                v-for="page in pages.filter(p => p.group.includes('setup'))"
                :key="page.name"
                @click="$refs.popover.close()"
              >
                <div>
                  <q-drawer-link :icon="page.icon" :to="page.to">{{ page.text }}</q-drawer-link>
                </div>
              </div>
              <div class="version">Version {{ version }}</div>
            </div>
          </q-popover>
        </button>
      </div>
    </template>
  </q-layout>
</template>
<script src="./App.vue.js"></script>
<style src="./App.vue.css"></style>
