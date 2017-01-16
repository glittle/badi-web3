<template>
  <article class="layout-padding" id="Listing">
    <button v-on:click="loadDates(prevYear)" class="small light btnPrev">Previous year ({{prevYear}} BE)</button>
    <h3>{{this.title}}</h3>
    <div class=location>Times for <span v-html="location"></span></div>
    <div class="switches">
      <div class="toggles">
        <label>
          <q-toggle v-model="includeHolyDays" class="teal" id="includeHolyDays"></q-toggle>
          <span v-msg="'includeHolyDays,extractAccessKeyFor:includeHolyDays'"></span>
        </label>
        <label>
          <q-toggle v-model="includeFeasts" class="teal" id="includeFeasts"></q-toggle>
          <span v-msg="'includeFeasts,extractAccessKeyFor:includeFeasts'"></span>
        </label>
        <label>
          <q-toggle v-model="includeOther" class="teal" id="includeOther"></q-toggle>
          <span v-msg="'includeOther,extractAccessKeyFor:includeOther'"></span>
        </label>
        <label>
          <q-toggle v-model="includeFast" class="teal" id="includeFast"></q-toggle>
          <span v-msg="'includeFast,extractAccessKeyFor:includeFast'"></span>
        </label>
      </div>
      <div class="suggestedStart">
        <span>Suggested start at </span>
        <select v-model=suggestedStart>
          <option value="">none</option>
          <option value=1800>6:00 pm</option>
          <option value=1830>6:30 pm</option>
          <option value=1900>7:00 pm</option>
          <option value=1930>7:30 pm</option>
          <option value=2000>8:00 pm</option>
        </select></div>
    </div>
    <div class="dayList">
      <div class="item" v-for="day in filteredList" :id="makeId(day.di)">
        <div class="item-content dayContent Feast" :class="day.RowClass" v-if="day.Type==='M'">
          <div class="col1">
            <!--<span class=dayType><i>date_range</i></span>-->
            <img :class="day.di.element" src="../statics/calendar.png">
            <div>{{day.di.bMonth}}</div>
          </div>
          <div class="col2">
            <!--<input type="checkbox" class=toggleInfo></div>-->
            <div class=dayName v-html="day.Month"></div>
            <div v-html="day.A"></div>
            <div :class="getSpecialTime(day).classes" v-html="getSpecialTime(day).html"></div>
            <div v-html="day.A2"></div>
            <!--<div class=toggleInfoTarget>
              More Info!
            </div>-->
          </div>
          <div class="col3">
            <div class=sunsetStart>
              <img src="../statics/sunset.png">
              <span v-html="day.Sunset"></span>
            </div>
            <div class=gDate v-html="day.di.gCombinedY">
            </div>
          </div>
        </div>
        <div class="item-content dayContent HolyDay" :class="day.RowClass" v-if="day.Type[0]==='H'">
          <div class="col1">
            <!--<span class=dayType><i>star</i></span>-->
            <img src="../statics/star.png">
          </div>
          <div class="col2">
            <div class=dayName v-html="day.A"></div>
            <div v-html="day.D"></div>
            <div v-html="day.A2"></div>
            <div :class="getNoWorkClass(day.di.frag2Weekday)" v-html="getNoWork(day.NoWork)"></div>
            <div :class="getSpecialTime(day).classes" v-html="getSpecialTime(day).html"></div>
          </div>
          <div class="col3">
            <div class=sunsetStart>
              <img src="../statics/sunset.png">
              <span v-html="day.Sunset"></span>
            </div>
            <div class=gDate v-html="day.di.gCombinedY">
            </div>
          </div>
        </div>
        <div class="item-content dayContent Fast" :class="day.RowClass" v-if="day.Type==='Fast'">
          <div class="col1">
            <!--<span class=dayType><i>date_range</i></span>-->
            <img src="../statics/sun.png">
          </div>
          <div class="col2">
              <div class=dayName v-html="day.NameEn"></div>
            <div>
              <span v-html="day.D"></span>
              <span>-</span>
              <span v-html="day.FastDay"></span>
            </div>
          </div>
          <div class="col3">
            <div class=sunsetStart>
              <div>
                <img src="../statics/sunrise.png">
                <span v-html="day.FastSunrise"></span>
              </div>
              <div>
                <img src="../statics/sunset.png">
                <span v-html="day.FastSunset"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="item-content dayContent Other" :class="day.RowClass" v-if="day.Type==='OtherDay'">
          <div class="col1">
          </div>
          <div class="col2">
            <div class=dayName v-html="day.NameEn"></div>
            <div v-html="day.D"></div>
            <div v-html="day.A2"></div>
          </div>
          <div class="col3">
            <div class=sunsetStart>
              <img src="../statics/sunset.png">
              <span v-html="day.Sunset"></span>
            </div>
            <div class=gDate v-html="day.di.gCombinedY">
            </div>
          </div>
        </div>
        <div class="item-content dayContent Other" :class="day.RowClass" v-if="day.Type==='Ayyam'">
          <div class="col1">
          </div>
          <div class="col2">
            <div class="dayName" v-html="day.NameAr"></div>
            <div v-html="'{daysInAyyamiHa} {A}'.filledWith(day)"></div>
          </div>
          <div class="col3">
            <div class="sunsetStart">
              <img src="../statics/sunset.png">
              <span v-html="day.Sunset"></span>
            </div>
            <div class="gDate" v-html="day.di.gCombinedY + '<br>to<br>' + day.lastDayDi.gCombinedY">
              <!--<span v-html="day.di.gCombined"></span>-->
              <span>to</span>
              <!--<span v-html="day.lastDayDi.gCombinedY"></span>-->
            </div>
          </div>
        </div>
        <div class="item-content dayContent Today" :class="day.RowClass" v-if="day.Type==='Today'">
          <div class="col1"> </div>
          <div class="col2">
            Today: <span v-html="day.D"></span></div>
          <div class="col3">
            <div class=sunsetStart>
              <img src="../statics/sunset.png">
              <span v-html="day.Sunset"></span>
            </div>
            <div class=gDate v-html="day.di.gCombinedY">
            </div>
          </div>
        </div>
      </div>
    </div>
    <button v-on:click="loadDates(nextYear)" class="primary full-width">Next year ({{nextYear}} BE)</button>
    <button v-on:click="resetToFirstYear()" class="light full-width">Reset to this year only</button>
  </article>
</template>
<script src="./Listing.vue.js"></script>
<style src="./Listing.vue.css"></style>
