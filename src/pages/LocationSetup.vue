<template>
  <article class="LocationSetup layout-padding">
    <h1>Location</h1>
    <div class="section">
      <p>Enter the location manually below, or click the "Get Location" button.
      </p>
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
      <p v-show="statusLines.length">
        <b>Status</b>
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
  import moment from 'moment'

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
        title: 'Location',
        icon: 'place',
        lat: shared.coords.lat,
        lng: shared.coords.lng,
        name: shared.coords.name,
        timezone: moment.tz.guess().replace(/_/g, ' '),
        statusLines: []
      }
    },
    validators: {
      lat: function (value) {
        // console.log('validate lat')
        return Validator.value(value).required().float().between(-85, 85);
      },
      lng: function (value) {
        // console.log('validate lng')
        return Validator.value(value).required().float().between(-180, 180);
      },
    },
    computed: {
      timezone() {
        var tz = moment.tz.guess();
        return `${tz.replace(/_/g, ' ')} (${moment.tz(tz).format("Z z")})`
      }
    },
    created() {},
    watch: {
      lat: function (n, o) {
        this.checkValidation('lat', n)
          // console.log(n, o)
      },
      lng: function (n, o) {
        this.checkValidation('lng', n)
          // console.log(n, o)
      },
      name: function (n, o) {
        storage.set('coord.name', n);
      },
      statusLines: function (n, o) {
        // clearTimeout(timeout);
        if (!clearLog) {
          return;
        }
        var a = this.statusLines;
        setTimeout(function () {
          if (a.length > 0) {
            a.shift(); // may get out of sync if rapid changes
          }
        }, 1500);
      }
    },
    methods: {
      checkValidation(which, n) {
        this.$validate()
          .then(function (success) {
            if (success) {
              // alert('Validation succeeded!');

              storage.set('coord.' + which, n);

              this.getLocationName();
              storage.set('coord.source', 'user');
            } else {
              // console.log(success)
            }
          });
      },
      getLocation() {
        clearLog = true;
        try {
          var vue = this;
          vue.statusLines.push('Determining location')
          navigator.geolocation.getCurrentPosition(function (loc) {
            vue.lat = loc.coords.latitude;
            vue.lng = loc.coords.longitude;
            storage.set('coord.lat', loc.coords.latitude);
            storage.set('coord.lng', loc.coords.longitude);
            storage.set('coord.source', 'user');

            vue.statusLines.push('Learned coordinates')

            // OneSignal.sendTag("latitude", settings.locationLat);
            // OneSignal.sendTag("longitude", settings.locationlng);
            vue.getLocationName();
          })
        } catch (e) {
          vue.statusLines.push(e.message);
          clearLog = false;
        }
      },
      openMap() {
        var url = `https://www.google.ca/maps/place/${this.name}/@${this.lat},${this.lng},10z`;
        window.open(url, 'map');
      },
      getLocationName() {
        clearLog = true;
        var vue = this;
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${vue.lat},${vue.lng}`;
        vue.statusLines.push('Determining name')

        axios.get(url)
          .then(function (response) {
            var results = response.data.results;
            var location = '';
            // get longest locality
            console.log(results)
            for (var r = 0; r < results.length; r++) {
              var components = results[r].address_components;
              for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.types.includes('locality')) { //$.inArray('political', component.types)!=-1 &&
                  // vue.statusLines.push('--> ' + component.long_name)
                  // console.log(component)
                  if (component.short_name.length > location.length) {
                    location = component.short_name;
                  }
                }
              }
            }

            if (location) {
              vue.statusLines.push('==> ' + location)
            } else {
              clearLog = false;
              vue.statusLines.push('No location!')
            }
            //OneSignal.sendTag("location", location);
            //OneSignal.sendTag("zoneName", moment.tz.guess());
            storage.set('coord.name', location);
            vue.name = location;
          })
          .catch(function (error) {
            console.log(error);
          });
      },
    }
  }

</script>
