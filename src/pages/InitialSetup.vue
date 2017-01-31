<template>
  <div class="InitialSetup">
    <article>
      <div class="card">
        <div class="card-content">
          <p>Welcome to the Wondrous-Badí' Calendar app!</p>
          <p>To get started, there are two things we need to do...</p>
        </div>
      </div>
    </article>
    <article>
      <div class="card">
        <div class="card-content">
          <div v-bind:disabled="locationSet">
            <h4>1. Set your Location <span v-show="locationSet" class="Done">Done!</span></h4>
            <p>Why? &nbsp; Days in the Wondrous-Badí calendar start at sunset and to know when the sun sets, we need your location!</p>
            <!--<p>Click here:
              <q-drawer-link v-for="page in pages.filter(p=>p.name==='LocationSetup')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
            </p>-->
          </div>
          <component v-bind:is="page.component" v-for="page in routes.filter(p=>p.name==='LocationSetup')"></component>
        </div>
      </div>
    </article>
    <article>
      <div class="card">
        <div class="card-content">
          <div v-bind:disabled="notificationDone">
            <h4>2. Turn on Notifications <span v-show="notificationDone" class="Done">Done!</span></h4>
            <p>Why? &nbsp; On most computer and phones, we can show you a notification with today's date. This is not required,
              but you should try it!</p>
            <p>Click here:
              <q-drawer-link v-for="page in pages.filter(p=>p.name==='Notifications')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
            </p>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
<style src="./InitialSetup.vue.css"></style>
<script src="./InitialSetup.vue.js"></script>
