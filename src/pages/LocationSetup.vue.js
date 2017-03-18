import axios from 'axios'
import * as shared from '../scripts/shared'
import moment from 'moment'
import badiCalc from '../scripts/badiCalc'
import * as store from '../scripts/store'
import storage from '../scripts/storage'

var Vue = require('vue');
var versionInfo = require('../../root/version.json');

//--> after updates, SimpleVueValidation is failing
// var SimpleVueValidation = require('simple-vue-validator');
// var Validator = SimpleVueValidation.Validator;
// Vue.use(SimpleVueValidation);

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
      statusLines: [],
      gettingLocation: false,
      gettingName: false,
      // manual validator to match SimpleVueValidation
      latError: false,
      lngError: false,
      latSaved: 0 + shared.coords.lat,
      lngSaved: 0 + shared.coords.lng
    }
  },
  // validators: {
  //   lat: function (value) {
  //     return Validator.value(value).required().float().between(-85, 85);
  //   },
  //   lng: function (value) {
  //     return Validator.value(value).required().float().between(-180, 180);
  //   },
  // },
  computed: {
    saveNeeded() {
      // if needed and possible
      if (this.lat == 0 || this.lng == 0) {
        return false;
      }
      if (this.lat === this.latSaved && this.lng == this.lngSaved) {
        return false;
      }
      return true;
    },
    timezone() {
      var tz = moment.tz.guess();
      return `${tz.replace(/_/g, ' ')} (${moment.tz(tz).format("Z z")})`
    }
  },
  created() {
    if (!shared.coords.sourceIsSet) {
      this.guessLocation();
    }
  },
  watch: {
    lat: function (n, o) {
      this.checkValidation('lat', n)
    },
    lng: function (n, o) {
      this.checkValidation('lng', n)
    },
    name: function (n, o) {
      shared.coords.name = n || '';
    },
    statusLines: function (n, o) {
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
    saveCoords: function (source) {
      var vue = this;
      shared.coords.source = source;
      this.latSaved = this.lat;
      this.lngSaved = this.lng;
      store.doPulse();

      // if (storage.get('initialSetup', false)) {
      //   setTimeout(function () {
      //     vue.$router.go(-1);
      //   }, 1000);
      // }
    },
    guessLocation() {
      var vue = this;
      var url = "http://ipinfo.io/geo?json";
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          var info = JSON.parse(xhr.responseText);
          var loc = info.loc.split(',');
          // saveLocation(loc[0], loc[1], info.city);
          vue.lat = loc[0];
          vue.lng = loc[1];
          var location = info.city;

          vue.addToLog('Guessed coordinates')

          OneSignal.sendTag("latitude", vue.lat);
          OneSignal.sendTag("longitude", vue.lng);
          OneSignal.sendTag("version", versionInfo.version);
          vue.gettingLocation = false;

          vue.saveCoords('guess');

          OneSignal.sendTag("location", location);
          OneSignal.sendTag("zoneName", moment.tz.guess());
          shared.coords.name = location;
          vue.name = location;
        }
      }
      xhr.open("GET", url, true);
      xhr.timeout = 1000;
      //xhr.ontimeout = function () { continueAfterLocationKnown(); };
      xhr.send();
      return true;
    },
    checkValidation(which, n) {
      // "SimpleVueValidation" is failing... do manual validation
      var value = +n;
      var min, max;
      switch (which) {
        case 'lat':
          min = -85;
          max = 85;
          break;

        case 'lng':
          min = -180;
          max = 180;
          break;

        default:
          //force a failure
          min = 1;
          max = -1;
          break;
      }

      if (n >= min && n <= max) {
        this[which + 'Error'] = false;
        shared.coords[which] = +n;

        this.getLocationName();
      } else {
        this[which + 'Error'] = true;
      }

      // this.$validate()
      //   .then(function (success) {
      //     if (success) {
      //       // alert('Validation succeeded!');



      //       shared.coords[which] = n;

      //       this.getLocationName();
      //       shared.coords.source = 'user';
      //     } else {
      //       // console.log(success)
      //     }
      //   });
    },
    getLocation() {
      this.gettingLocation = true;
      var vue = this;
      clearLog = true;
      try {
        vue.addToLog('Determining location')
        navigator.geolocation.getCurrentPosition(function (loc) {
          vue.lat = loc.coords.latitude;
          vue.lng = loc.coords.longitude;

          vue.addToLog('Learned coordinates')

          OneSignal.sendTag("latitude", vue.lat);
          OneSignal.sendTag("longitude", vue.lng);
          OneSignal.sendTag("version", versionInfo.version);
          vue.gettingLocation = false;

          vue.saveCoords('getter');

          vue.getLocationName();
        })
      } catch (e) {
        vue.addToLog(e.message);
        clearLog = false;
        vue.gettingLocation = false;
      }
    },
    openMap() {
      var url = `https://www.google.ca/maps/place/${this.name}/@${this.lat},${this.lng},10z`;
      window.open(url, 'map');
    },
    getLocationName() {
      clearLog = true;
      var vue = this;
      vue.gettingName = true;

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
            location = '(unknown)'
            clearLog = false;
            vue.addToLog('No location!')
          }
          vue.gettingName = false;

          OneSignal.sendTag("location", location);
          OneSignal.sendTag("zoneName", moment.tz.guess());
          shared.coords.name = location;
          vue.name = location;

          setTimeout(function () {
            vue.updateUiToNewLocation()
          }, 0)
        })
        .catch(function (error) {
          console.log(error);
          vue.gettingName = false;
        });
    },
    updateUiToNewLocation() {
      badiCalc.reset();
      store.doPulse();
    },
    addToLog(msg) {
      var vue = this;
      // console.log(msg);
      if (vue.statusLines.indexOf(msg) === -1) {
        vue.statusLines.push(msg)
      }
    }
  }
}
