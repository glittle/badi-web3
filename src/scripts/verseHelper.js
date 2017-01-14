import verses from '../assets/verses.json'
require('../scripts/stringExt')

function forDi(thisDi) {
  var key = '{currentMonth1}.{currentDay}'.filledWith(thisDi);
  var dayVerses = verses[key];
  if (dayVerses) {
    var isEve = thisDi.bNow.eve;
    var verseInfo = dayVerses[isEve ? 'pm' : 'am'];

    if (verseInfo) {
      return {
        suffix: `Bahá'u'lláh, ${verseInfo.r}`,
        verse: verseInfo.q
      }
    }
  }
  return {};
}

export default {
    forDi
}
