<template>
  <article class="layout-padding" id="Listing">
    <h3>{{this.title}}</h1>
      <div class="switches">
        <label><q-toggle v-model="includeHolyDays" class="teal" id="includeHolyDays"></q-toggle>
          <span v-msg="'includeHolyDays,extractAccessKeyFor:includeHolyDays'"></span>
        </label>
        <label><q-toggle v-model="includeFeasts" class="teal" id="includeFeasts"></q-toggle>
          <span v-msg="'includeFeasts,extractAccessKeyFor:includeFeasts'"></span>
        </label>
      </div>
      <div class="list">
        <div class="item" v-for="day in filteredList">
          <div class="item-content dayContent Feast" v-if="day.Type==='M'">
            <div class="col1">
              <!--<span class=dayType><i>date_range</i></span>-->
              <img src="../statics/calendar.png">
            </div>
            <div class="col2">
              <div class=dayName v-html="day.A"></div>
              <div>{{day.Month}}</div>
            </div>
            <div class="col3">
              <div class=sunsetStart>
                <i>wb_sunny</i> {{day.Sunset}}
              </div>
            </div>
          </div>
          <div class="item-content dayContent HolyDay" v-if="day.Type[0]==='H'">
            <div class="col1">
              <!--<span class=dayType><i>star</i></span>-->
              <img src="../statics/star.png">
              </div>
            <div class="col2">
              <div class=dayName v-html="day.A"></div>
              <div>{{day.D}}</div>
            </div>
            <div class="col3">
              <div class=sunsetStart>
                <i>wb_sunny</i> {{day.Sunset}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--<q-list-item v-for="item in filteredList" :item="item" link :active="itemIsSelected" @click.native="clickedOnItem()"></q-list-item>-->
      <!--<q-data-table :data="filteredList" :config="config" :columns="columns">
      <template slot="col-Type" scope="cell">
        <span class="light-paragraph" v-html="test(cell)"></span>
      </template>
    </q-data-table>-->
  </article>
</template>
<script src="./Listing.vue.js"></script>
<style src="./Listing.vue.css"></style>
