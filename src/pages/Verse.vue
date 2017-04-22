<template>
  <article class="layout-padding Verse">
    <div class="verseNav">
      <button class="small light"
              v-on:click="showPrevious">Previous</button>
      <button class="small light"
              v-on:click="showNext"
              v-bind:disabled="!canShowNext">Next</button>
    </div>
    <div class="verseHost">
      <div class="verseText"
           v-html="verse"></div>
      <div class="suffix"
           v-html="suffix"></div>
      <div class="webSearch"
           v-if="online">
        <a target="_blank"
           rel="noopener"
           v-bind:href="searchUrl">
          <i>search</i> Find uses of this verse on
          <br>the Internet and YouTube
        </a>
      </div>
      <div class="speakButtons"
           v-if="offerVoice">
        <span>Read aloud</span>
        <button class="push small"
                accesskey="V"
                v-show="!speakingNow"
                @click="speak">
          <i>record_voice_over</i>
        </button>
        <button class="push small"
                accesskey="V"
                v-show="speakingNow"
                @click="stopSpeaking">
          <i>stop</i>
        </button>
        <q-range v-model="volume"
                 class="volume"
                 :step="10"
                 :min="0"
                 :max="100"></q-range>
        <!--<q-select :options="voices"
                    v-model="voice">
          </q-select>-->
      </div>
  
    </div>
    <p class="source">
      A verse for {{timeOfDay}}
      <br>from
      <cite>Reciting the Verses of God</cite> compiled
      <br>by Shahin Vafai & Dwight W. Allen.
    </p>
    <div class="reciting">
      <div></div>
    </div>
  </article>
</template>
<style src="./Verse.vue.css"></style>
<script src="./Verse.vue.js"></script>
