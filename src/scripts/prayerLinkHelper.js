import links from '../assets/prayers.json'
var _ = require('lodash');

function getRandom() {
  // var numLinks = links.length;
  // var target = Math.random * numLinks;
  return _.sample(links);
}

export default {
    getRandom
}
