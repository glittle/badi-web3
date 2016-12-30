import {
  LocalStorage
} from 'quasar'

export default {
  set: function (key, value) {
    LocalStorage.set(key, value)
  },
  get: function (key, defaultValue) {
    return LocalStorage.has(key) ? LocalStorage.get.item(key) : defaultValue
  }
}


// // based on code by Sunwapta Solutions Inc.
// var ObjectConstant = '$==$';

// const storage = window.localStorage;

// export function set(key, value) {
//   /// <summary>Save this value in the browser's local storage. Dates do NOT get returned as full dates!</summary>
//   /// <param name="key" type="string">The key to use</param>
//   /// <param name="value" type="string">The value to store. Can be a simple or complex object.</param>
//   if (value === null) {
//     storage.removeItem(key);
//     return null;
//   }

//   if (typeof value === 'object' || typeof value === 'boolean') {
//     var strObj = JSON.stringify(value);
//     storage[key] = ObjectConstant + strObj;
//   } else {
//     storage[key] = value + "";
//   }

//   return value;
// }


// export function get(key, defaultValue) {
//   /// <summary>Get a value from storage.</summary>
//   var checkForObject = function (obj) {
//     if (obj.substring(0, ObjectConstant.length) === ObjectConstant) {
//       obj = JSON.parse(obj.substring(ObjectConstant.length));
//     }
//     return obj;
//   };

//   var value = storage[key];
//   if (typeof value !== 'undefined' && value != null) {
//     return checkForObject(value);
//   }
//   return defaultValue;
// }
