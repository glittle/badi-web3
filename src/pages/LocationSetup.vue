<template>
  <article class="LocationSetup layout-padding">
    <h1>Location</h1>
    <div class="section">
      <p>Enter your location manually below, or click the "Get Location" button.
      </p>
      <div class="statusLines" v-show="statusLines.length">
        <b>Name Search</b>
        <div class='status' v-html="statusLines.join('<br>')"></div>
      </div>
      <p><span>Latitude</span>
        <input type="number" min="-85" max="85" step="any" v-model.number="lat" :class="{'has-error': validation.hasError('lat')}">
      </p>
      <p><span>Longitude</span>
        <input type="number" min="-180" max="180" step="any" v-model.number="lng" :class="{'has-error': validation.hasError('lng')}">
      </p>
      <p>
        <span>Name</span><input type="text" v-model="name">
      </p>
      <p>
        <span>Time zone</span><span v-text="timezone"></span>
      </p>
      <p class=buttons>
        <button @click="getLocation" class="small primary">Get Location</button>
        <button @click="openMap" class="small light">Show on a Map</button>
      </p>
      <div class="card">
        <div class="card-content">
          The approximate location of this device/computer is required and must match its timezone!
        </div>
      </div>
      
    </div>
  </article>
</template>
<style src="./LocationSetup.vue.css"></style>
<script src="./LocationSetup.vue.js"></script>
