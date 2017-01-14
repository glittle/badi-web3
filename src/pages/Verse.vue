<template>
  <article class="layout-padding Verse">
    <div class="verseHost">
      <div class="verseText" v-html="verse"></div>
      <div class="suffix" v-html="suffix"></div>
      <div class="webSearch" v-if="online">
        <a target="_blank" v-bind:href="searchUrl">
          <i>search</i> Find uses of this verse on the Internet and YouTube
        </a>
      </div>
      <div class="speakButtons">
        <button id="btnRead" class="push small" v-show="offerVoice" @click="speak">
          <i>record_voice_over</i>
        </button>
      </div>
    </div>
    <div class="verseNav">
      <button class="small light" v-on:click="showPrevious">Previous</button>
      <button class="small light" v-on:click="showNext" v-bind:disabled="!canShowNext">Next</button>
    </div>
    <p class="source">
      A verse for {{timeOfDay}} 
      <br>from <cite>Reciting the Verses of God</cite> compiled
      <br>by Shahin Vafai & Dwight W. Allen.
    </p>
    <div class="reciting">
      <div></div>
    </div>
  </article>
</template>
<style src="./Verse.vue.css"></style>
<script src="./Verse.vue.js"></script>
