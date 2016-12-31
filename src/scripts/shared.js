import storage from './storage'

var coords = {
  lat: storage.get('coord.lat', 42.0744279), // House of Worship  :)
  lng: storage.get('coord.lng', -87.6843469),
  name: storage.get('coord.name', 'Wilmette'),
  source: storage.get('coord.source', 'default')
}


export {
  coords
}
