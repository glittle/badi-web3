import storage from './storage'

var coords = {
  lat: storage.get('coord.lat', 42.0744279), // House of Worship  :)
  long: storage.get('coord.long', -87.6843469),
  name: storage.get('coord.name', 'unknown'),
  source: storage.get('coord.source', 'default')
}


export {
  coords
}
