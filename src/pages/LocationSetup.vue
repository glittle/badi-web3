<template>
  <article class="LocationSetup layout-padding">
    <h1>Location</h1>
    <div class="section">
      <div>
        Where are you now?
        <button @click="getLocation" class="small primary">Learn</button>
      </div>
      <p><span>Latitude</span>
        <input type="number" min="-85" max="85" step="any" v-model="lat" :class="{'has-error': validation.hasError('lat')}">
      </p>
      <p><span>Longitude</span><input type="number" min="-180" max="180" step="any" v-model="lng" :class="{'has-error': validation.hasError('lng')}"></p>
      <p><span>Name</span><input type="text" v-model="name">
        <!--<button @click="getLocationName" class="small secondary">Lookup</button>-->
      </p>
      <p>
        <button @click="openMap" class="small light">Show on a Map</button>
      </p>
      <p v-show="statusLines.length"><span>Status</span>
        <div class='status' v-html="statusLines.join('<br>')"></div>
      </p>
    </div>
  </article>
</template>
<style src="./LocationSetup.vue.css"></style>
<script>
  import axios from 'axios'
  import * as shared from '../scripts/shared'
  import storage from '../scripts/storage'

  var Vue = require('vue');
  var SimpleVueValidation = require('simple-vue-validator');
  var Validator = SimpleVueValidation.Validator;

  Vue.use(SimpleVueValidation);

  // var timeout = null;
  var clearLog = true;

  export default {
    name: 'Setup',
    data() {
      return {
        title: 'Setup Location',
        icon: 'place',
        lat: shared.coords.lat,
        lng: shared.coords.lng,
        name: shared.coords.name,
        statusLines: []
      }
    },
    validators: {
      lat: function (value) {
        return Validator.value(value).required().float().between(-85, 85);
      },
      lng: function (value) {
        return Validator.value(value).required().float().between(-180, 180);
      },
    },
    created() {},
    watch: {
      lat: function (n, o) {
        this.checkValidation()
        console.log(n, o)
      },
      lng: function (n, o) {
        this.checkValidation()
        console.log(n, o)
      },
      statusLines: function (n, o) {
        // clearTimeout(timeout);
        if (!clearLog) {
          return;
        }
        var a = this.statusLines;
        setTimeout(function () {
          if (a.length > 0) {
            a.shift();
          }
        }, 1200);
      }
    },
    methods: {
      checkValidation() {
        this.$validate()
          .then(function (success) {
            if (success) {
              // alert('Validation succeeded!');
              this.getLocationName();
            } else {
              console.log(success)
            }
          });
      },
      getLocation() {
        clearLog = true;
        try {
          var thisVue = this;
          thisVue.statusLines.push('Determining location')
          navigator.geolocation.getCurrentPosition(function (loc) {
            thisVue.lat = loc.coords.latitude;
            thisVue.lng = loc.coords.longitude;
            storage.set('coord.lat', loc.coords.latitude);
            storage.set('coord.lng', loc.coords.longitude);
            storage.set('coord.source', 'geo');

            thisVue.statusLines.push('Learned coordinates')

            // OneSignal.sendTag("latitude", settings.locationLat);
            // OneSignal.sendTag("longitude", settings.locationlng);
            thisVue.getLocationName();
          })
        } catch (e) {
          thisVue.statusLines.push(e.message);
          clearLog = false;
        }
      },
      openMap() {
        var url = `https://www.google.ca/maps/place/${this.thisVue.name}/@${this.lat},${this.thisVue.lng},10z`;
        window.open(url, 'map');
      },
      getLocationName() {
        clearLog = true;
        var thisVue = this;
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${thisVue.lat},${thisVue.lng}`;
        thisVue.statusLines.push('Determining name')

        axios.get(url)
          .then(function (response) {
            var results = response.data.results;
            var location = '';
            // get longest locality
            for (var r = 0; r < results.length; r++) {
              var components = results[r].address_components;
              for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.types.includes('locality')) { //$.inArray('political', component.types)!=-1 &&
                  // thisVue.statusLines.push('--> ' + component.long_name)
                  // console.log(component)
                  if (component.short_name.length > location.length) {
                    location = component.short_name;
                  }
                }
              }
            }

            if (location) {
              thisVue.statusLines.push('==> ' + location)
            } else {
              clearLog = false;
              thisVue.statusLines.push('No location!')
            }
            //OneSignal.sendTag("location", location);
            //OneSignal.sendTag("zoneName", moment.tz.guess());
            storage.set('coord.name', location);
            thisVue.name = location;
          })
          .catch(function (error) {
            console.log(error);
          });
      },
    }
  }

</script>
