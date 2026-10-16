<template>
  <article class="LocationSetup layout-padding">
    <h1 v-if="isPage" data-page-heading>Location</h1>
    <h2 v-else class="pageTitle">Location</h2>
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
          Click "Lookup My Location" below, or manually set your location coordinates.
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
            <span id="locLatLabel">Latitude:</span>
            <input type="number"
                   aria-labelledby="locLatLabel"
                   :aria-invalid="latError ? 'true' : null"
                   min="-85"
                   max="85"
                   step="any"
                   v-model.number="lat"
                   :class="{'has-error': latError}">
            <span class="busy"
                  v-show="gettingLocation"></span>
          </div>
          <div>
            <span id="locLngLabel">Longitude:</span>
            <input type="number"
                   aria-labelledby="locLngLabel"
                   :aria-invalid="lngError ? 'true' : null"
                   min="-180"
                   max="180"
                   step="any"
                   v-model.number="lng"
                   :class="{'has-error': lngError}">
          </div>
          <div>
            <span id="locNameLabel">Name:</span>
            <input type="text"
                   aria-labelledby="locNameLabel"
                   v-model="name"
                   v-if="!gettingName">
            <span class="busyWord"
                  role="status"
                  v-if="gettingName">(getting name)</span>
          </div>
          <div>
            <span>Time zone:</span><span v-text="timezone"></span>
          </div>
          <p>
            The location can be approximate, but must be in the timezone to work correctly!
          </p>
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
