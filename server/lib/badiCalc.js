'use strict';
// Port of https://github.com/glittle/BadiService2 (BadiMain/BadiCalc.cs, BadiNames.cs, PresetKnowledge.cs)
const OFFSETS = require('./nawRuzOffsets.json'); // NawRuzOffsetFrom21 from PresetKnowledge.cs (bYear -> offset)

const MONTH_MEANING = 'Intercalary Days,Splendor,Glory,Beauty,Grandeur,Light,Mercy,Words,Perfection,Names,Might,Will,Knowledge,Power,Speech,Questions,Honor,Sovereignty,Dominion,Loftiness'.split(',');
const MONTH_ARABIC = "Ayyám-i-Há,Bahá,Jalál,Jamál,`Azamat,Núr,Rahmat,Kalimát,Kamál,Asmá’,`Izzat,Mashíyyat,`Ilm,Qudrat,Qawl,Masá'il,Sharaf,Sultán,Mulk,`Alá’".split(',');

class DateError extends Error {}

// A "DateTime.Date" is represented as an integer day number (days since 1970-01-01, proleptic Gregorian).
function dayNum(y, m, d) {
  if (!(y >= 1 && y <= 9999 && m >= 1 && m <= 12)) throw new DateError('out of range');
  const dt = new Date(0);
  dt.setUTCFullYear(y, m - 1, 1);
  dt.setUTCHours(0, 0, 0, 0);
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  if (!(d >= 1 && d <= daysInMonth)) throw new DateError('out of range');
  return Math.round(dt.getTime() / 864e5) + d - 1;
}
const MAX_DAY = dayNum(9999, 12, 31);
function yearOf(n) {
  const dt = new Date(n * 864e5);
  return dt.getUTCFullYear();
}
function addDays(n, k) {
  const r = n + k;
  if (r < dayNum(1, 1, 1) || r > MAX_DAY) throw new DateError('out of range');
  return r;
}

function getNawRuzOffset(bYear) {
  return Object.prototype.hasOwnProperty.call(OFFSETS, bYear) ? OFFSETS[bYear] : 0;
}
// GetNawRuz(gYear, frag2DateOnly: true)
function getNawRuz(gYear) {
  return dayNum(gYear, 3, 21 + getNawRuzOffset(gYear - 1843));
}

// relationToSunset: integer value of the RelationToSunset enum (2 = gAfterSunset)
function getBadiDate(gSource, relationToSunset) {
  const after = relationToSunset === 2;
  const relationToMidnight = after ? 1 : 2;
  if (after) gSource = addDays(gSource, 1);

  const gYear = yearOf(gSource);
  const gDayOfNawRuz = getNawRuz(gYear);
  const gDayLoftiness1 = addDays(gDayOfNawRuz, -19);
  const bYear = gYear - (gSource >= gDayOfNawRuz ? 1843 : 1844);
  let bMonth, bDay;
  if (gSource < gDayLoftiness1) {
    const lastYearLoftiness1 = addDays(getNawRuz(gYear - 1), -19);
    const daysAfter = gSource - lastYearLoftiness1;
    const numMonths = Math.floor(daysAfter / 19);
    bDay = 1 + daysAfter - numMonths * 19;
    bMonth = numMonths;
    if (bMonth === 19) bMonth = 0;
  } else {
    const daysAfter = gSource - gDayLoftiness1;
    const numMonths = Math.floor(daysAfter / 19);
    bDay = 1 + daysAfter - numMonths * 19;
    bMonth = numMonths;
    if (bMonth === 0) bMonth = 19;
  }
  return {
    year: bYear,
    month: bMonth,
    day: bDay,
    badiMonthInfo: { localName: MONTH_MEANING[bMonth], arabicName: MONTH_ARABIC[bMonth] },
    badiDayInfo: { localName: MONTH_MEANING[bDay], arabicName: MONTH_ARABIC[bDay] },
    relationToMidnight,
  };
}

function ymdOf(n) {
  const dt = new Date(n * 864e5);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

module.exports = { getBadiDate, dayNum, ymdOf, DateError };
