<template>
  <article class="LocationSetup layout-padding">
    <h1>Location</h1>
    <div class="section">
      <p>
        Please confirm the location of this device/computer. It can be approximate, but must match its timezone!</p>
      <p>
        Click "Lookup My Location" below, or manually adjust your location coordinates.
      </p>
      <p class="latlng">
        <span>
          <button @click="getLocation" class="small primary">Lookup My Location</button>
        </span>
        <span>
            <span>Latitude:</span>
            <input type="number"
               min="-85"
               max="85"
               step="any"
               v-model.number="lat"
               :class="{'has-error': latError}">
        </span>
        <span>
            <span>Longitude:</span>
            <input type="number"
               min="-180"
               max="180"
               step="any"
               v-model.number="lng"
               :class="{'has-error': lngError}">
        </span>
        <span>
            <button v-show="saveNeeded" 
                    v-on:click="saveCoords('user')"
                    class="small light primary">Save</button>
            <span class="busy" v-show="gettingLocation">
                  <span></span>
        </span>
        </span>
      </p>
      <p>
        <span>Name:</span>
        <input type="text"
               v-model="name"
               v-if="!gettingName">
        <span class="busyWord"
              v-if="gettingName">
            (getting name)
          </span>
      </p>
      <p>
        <span>Time zone:</span><span v-text="timezone"></span>
      </p>
      <p class=buttons>
        <button @click="openMap"
                class="small light">Show in Google Maps</button>
      </p>
    </div>
  </article>
</template>
<style src="./LocationSetup.vue.css"></style>
<script src="./LocationSetup.vue.js"></script>
