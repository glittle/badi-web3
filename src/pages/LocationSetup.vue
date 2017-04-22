<template>
  <article class="LocationSetup layout-padding">
    <h1>Location</h1>
    <div class="section">
      <p>Please confirm the location of this device/computer.</p>
      <div v-show="guessing"
           class="confirmGuess">
        <p>Welcome here! &nbsp; Are you in or close to...</p>
        <div class="guessName"
             v-html="name + '?'"></div>
        <div class="confirmGuessBtns">
          <button @click="confirmLocation"
                  class="primary">Yes</button>
          <button @click="guessNo"
                  class="primary">No</button>
        </div>
  
      </div>
      <div v-show="!guessing">
        <p>
          Click "Lookup My Location" below, or manually adjust your location coordinates. They can be approximate, but must match the timezone!
        </p>
        <div class="latlng">
          <div>
            <button @click="getLocation"
                    v-bind:class="{primary: name==='(unknown)'}"
                    class="small secondary">Lookup My Location
  
            </button>
           <!--
            <button @click="openMap"
                    class="small secondary floatRight">Open Google Maps</button> -->
          </div>
          <div>
            <span>Latitude:</span>
            <input type="number"
                   min="-85"
                   max="85"
                   step="any"
                   v-model.number="lat"
                   :class="{'has-error': latError}">
            <span class="busy"
                  v-show="gettingLocation"></span>
          </div>
          <div>
            <span>Longitude:</span>
            <input type="number"
                   min="-180"
                   max="180"
                   step="any"
                   v-model.number="lng"
                   :class="{'has-error': lngError}">
          </div>
          <div>
            <span>Name:</span>
            <input type="text"
                   v-model="name"
                   v-if="!gettingName">
            <span class="busyWord"
                  v-if="gettingName">(getting name)</span>
          </div>
          <div>
            <span>Time zone:</span><span v-text="timezone"></span>
          </div>
          <div>
            <button v-on:click="confirmLocation"
                    class="small primary">Yes! &nbsp; Use This Location</button>
          </div>
  
        </div>
      </div>
    </div>
  </article>
</template>
<style src="./LocationSetup.vue.css"></style>
<script src="./LocationSetup.vue.js"></script>
