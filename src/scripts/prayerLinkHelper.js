import links from '../assets/prayers.json'
import sample from 'lodash/sample'

function getRandom() {
  // var numLinks = links.length;
  // var target = Math.random * numLinks;
  return sample(links);
}

export default {
    getRandom
}
