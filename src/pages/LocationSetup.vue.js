import axios from 'axios'
import * as shared from '../scripts/shared'
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
      shared.coords.name = n;
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



            shared.coords[which] = n;

            this.getLocationName();
            shared.coords.source = 'user';
          } else {
            // console.log(success)
          }
        });
    },
    getLocation() {
      clearLog = true;
      try {
        var vue = this;
        vue.addToLog('Determining location')
        navigator.geolocation.getCurrentPosition(function (loc) {
          vue.lat = loc.coords.latitude;
          vue.lng = loc.coords.longitude;
          // shared.coords.lat = loc.coords.latitude;
          // shared.coords.lng = loc.coords.longitude;
          shared.coords.source = 'user';

          vue.addToLog('Learned coordinates')

          // OneSignal.sendTag("latitude", settings.locationLat);
          // OneSignal.sendTag("longitude", settings.locationlng);
          vue.getLocationName();
        })
      } catch (e) {
        vue.addToLog(e.message);
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
      vue.addToLog('Determining name')

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
                // vue.statusLines.push('--> ' + component.long_name)
                // console.log(component)
                if (component.short_name.length > location.length) {
                  location = component.short_name;
                }
              }
            }
          }

          if (location) {
            vue.addToLog('==> ' + location);
          } else {
            clearLog = false;
            vue.addToLog('No location!')
          }
          //OneSignal.sendTag("location", location);
          //OneSignal.sendTag("zoneName", moment.tz.guess());
          shared.coords.name = location;
          vue.name = location;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    addToLog(msg) {
      var vue = this;
      if (vue.statusLines.indexOf(msg) === -1) {
        vue.statusLines.push(msg)
      }
    }
  }
}
