<template>
  <div class="InitialSetup">
    <article>
      <div class="card">
        <div class="card-content">
          <p>Welcome! To get started, there are two things you need to do...</p>
        </div>
      </div>
    </article>
    <article>
      <div class="card">
        <div class="card-content">
          <div>
            <h4>1. Set your Location <span v-show="locationSet" class="Done">(Done)</span></h4>
            <p>Why? &nbsp; Days in the Wondrous calendar start at sunset where you are!</p>
            <!--<p>Click here:
                  <q-drawer-link v-for="page in pages.filter(p=>p.name==='LocationSetup')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
                </p>-->
          </div>
          <component v-bind:is="page.component"
                     :key="page.key"
                     v-for="page in routes.filter(p=>p.name==='LocationSetup')"></component>
        </div>
      </div>
    </article>
    <article>
      <div class="card">
        <div class="card-content">
          <div>
            <h4>2. Turn on Notifications <span v-show="notificationDone" class="Done">(Done)</span></h4>
            <!--<p>Click here:
                  <q-drawer-link v-for="page in pages.filter(p=>p.name==='Notifications')" :icon="page.icon" :to="page.to">{{page.text}}</q-drawer-link>
                </p>-->
            <component v-bind:is="page.component"
                       v-bind:embedded="true"
                       :key="page.key"
                       v-on:permissionGranted="notificationDone = true"
                       v-for="page in routes.filter(p=>p.name==='Notifications')"></component>
          </div>
        </div>
      </div>
    </article>
    <article>
      <div class="card">
        <div class="card-content">
          <div>
            <h4>3. Next</h4>
            <p>Click one of the icons below to use the web app! </p>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
<style src="./InitialSetup.vue.css"></style>
<script src="./InitialSetup.vue.js"></script>
