import storage from './storage'

var coords = {
  lat: storage.get('coord.lat', 42.0744279), // House of Worship  :)
  lng: storage.get('coord.lng', -87.6843469),
  name: storage.get('coord.name', 'Wilmette'),
  source: storage.get('coord.source', 'default')
}

var formats = {
  topTitle: '{bDay} {bMonthNamePri}/{bMonthNameSec} {bYear} <span>{nearestSunsetDesc}</span>',
  statusIconText: '{bMonthNamePri}',
  noticationMain: '{bDay} {bMonthNamePri}/{bMonthNameSec} {bYear}',
  noticationSub: '{nearestSunset}',
}

export {
  coords,
  formats
}
