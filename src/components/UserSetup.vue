<template>
  <article class="Setup">
    <h2>Notifications</h2>
    <button v-on:click="testNotification">Test Notify</button>
    <h2>Location</h2>
    <div class="section">
      <div>
        Where are you now?
        <button v-on:click="getLocation" class="btn btn--raised btn--small primary">Learn</button>
        <button v-on:click="openMap" class="btn btn--raised btn--small">Show on a Map</button>
      </div>
      <p><span>Latitude</span><input type="number" min="-80" max="80" step="any" v-model="coords.lat"></p>
      <p><span>Longitude</span><input type="number" min="-180" max="180" step="any" v-model="coords.long"></p>
      <p><span>Name</span><input type="text" v-model="coords.name">
        <button v-on:click="getLocationName" class="btn btn--raised btn--small">Lookup</button>
      </p>
    </div>
    <h2>Language</h2>
  </article>
</template>
<style src="./UserSetup.vue.css"></style>
<script>
  import axios from 'axios'
  import * as shared from '../scripts/shared'
  import * as storage from '../scripts/storage'
  import * as notify from '../scripts/notification'

  export default {
    name: 'Setup',
    created() {},
    data() {
      return {
        title: 'How should it work?',
        coords: shared.coords
      }
    },
    methods: {
      getLocation() {
        try {
          var vue = this;
          navigator.geolocation.getCurrentPosition(function (loc) {
            vue.coords.lat = storage.set('coord.lat', loc.coords.latitude);
            vue.coords.long = storage.set('coord.long', loc.coords.longitude);

            // OneSignal.sendTag("latitude", settings.locationLat);
            // OneSignal.sendTag("longitude", settings.locationlng);
            vue.getLocationName();
          })
        } catch (e) {
          console.log(e);
        }
      },
      openMap() {
        var url = `https://www.google.ca/maps/place/${this.coords.name}/@${this.coords.lat},${this.coords.long},10z`;
        window.open(url, 'map');
      },
      getLocationName() {
        var vue = this;
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.coords.lat},${this.coords.long}`;
        axios.get(url)
          .then(function (response) {
            var results = response.data.results;
            var location = '';
            // get longest locality
            for (var r = 0; r < results.length; r++) {
              var components = results[r].address_components;
              for (var i = 0; i < components.length; i++) {
                var component = components[i];
                //   console.log(component)
                if (component.types.includes('locality')) { //$.inArray('political', component.types)!=-1 &&
                  if (component.short_name.length > location.length) {
                    location = component.short_name;
                  }
                }
              }
            }

            //OneSignal.sendTag("location", location);
            //OneSignal.sendTag("zoneName", moment.tz.guess());
            vue.coords.name = storage.set('coord.name', location);
          })
          .catch(function (error) {
            console.log(error);
          });
      },
      testNotification() {
        notify.showNow();
      }
    }
  }

</script>
