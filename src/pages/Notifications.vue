<template>
  <article class="Notifications layout-padding">
    <h1>Notifications</h1>
    <div v-if="!localPushSupported">
      <p>Unfortunately, we can't do notifications on this device.</p>
    </div>
    <div v-else>
      <div v-if="notificationsWanted==='denied'">
        <p>You have previously denied permission to show notifications. If you want to change that, you will need to use
            your browser's settings and unblock notifications for this website.</p>
            <p>
                <span>If you do unblock notifications, click </span>
                <button class="small primary"
                        v-on:click="askForPush">Ask Again</button> to allow for notifications.
              </p>
      </div>
      <div v-if="notificationsWanted==='default'"
           v-cloak>
        <p v-if="!embedded">
          Your phone or computer can show today's date in a "notification". This is not required, but you should try it!
        </p>
        <p>
          <span>Click</span>
          <button class="small primary"
                  v-on:click="askForPush">Ask Now</button> to allow for notifications.
        </p>
      </div>
      <div v-if="notificationsWanted==='granted'">
        <p>
          Click
          <button class="small primary"
                  v-on:click="testNotification">Show Now</button> to show the current notification.</p>
        <p>This notification will be refreshed whenever you visit the website.</p>
      </div>
      <div v-if="featureEnabled && remotePushSupported">
        <div v-if="!userId"
             v-cloak>
          Click
          <button class="small secondary">Enable</button> to prepare for remote notifications.
        </div>
      </div>
      <div v-if="featureEnabled && permission==='granted'"
           v-cloak>
        <div v-if="false">
          <h3>Additional notifications</h3>
          <fieldset>
            <legend>Add a Notification</legend>
            <div id="whenSun">Get a notification
              <select v-model="sunOffset">
                <option v-for="offset in offsets"
                        v-bind:value="offset.min">{{offset.desc}}</option>
              </select>
              <select v-model="sunType">
                <option value="sunset"
                        class="when_sunset">sunset</option>
                <option value="sunrise"
                        class="when_sunrise">sunrise</option>
              </select>
              <button v-on:click="addSunTime">Add</button>
            </div>
            <div id="whenCustom">Get a notification every day at
              <input type="time"
                     v-model="customWhen">
              <button v-on:click="addCustomTime">Add</button>
            </div>
          </fieldset>
          <div class="whenList">
            <div v-for="(when, i) in whens">
              <div v-if="when.type==='custom'">
                <span>{{when.time}} daily</span>
                <button class="removeWhen">X {{i}}</button>
              </div>
              <div v-if="when.type!=='custom'">
                <span v-html="getOffsetDesc(when.offset)"></span> <span>{{when.type}}</span>
                <button class="removeWhen">X {{i}}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
<style src="./Notifications.vue.css"></style>
<script src="./Notifications.vue.js"></script>
