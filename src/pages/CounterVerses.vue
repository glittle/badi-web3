<template>
    <article class="CounterVerses layout-padding" :data-verse="verse.id">
        <div class="heading">
            <button type="button" class="small light round back" v-on:click="goBack">Back</button>
            <span class="desc">Verses</span>
            <span class="index">{{ index + 1 }} / {{ verses.length }}</span>
        </div>
        <div class="cvTop">
            <div class="cvCarousel"
                 ref="carousel"
                 v-touch-swipe.horizontal="onSwipe"
                 v-on:pointerdown="onPointerDown"
                 v-on:pointerup="onPointerUp"
                 v-on:pointercancel="onPointerCancel">
                <button type="button"
                        class="cvArrow"
                        aria-label="Previous verse"
                        v-bind:disabled="index === 0"
                        v-on:click="showPrevious">
                    <i>keyboard_arrow_left</i>
                </button>
                <div class="cvSlide" aria-live="polite">
                    <h2>{{ verse.title }}</h2>
                    <p class="cvText">{{ verse.text }}</p>
                    <p class="cvTimes">{{ verse.target }} times</p>
                    <p class="cvSource">
                        <a v-bind:href="verse.url" target="_blank" rel="noopener">{{ verse.source }}</a>
                    </p>
                </div>
                <button type="button"
                        class="cvArrow"
                        aria-label="Next verse"
                        v-bind:disabled="index === verses.length - 1"
                        v-on:click="showNext">
                    <i>keyboard_arrow_right</i>
                </button>
            </div>
            <div class="cvPager" role="tablist" aria-label="Verses">
                <button type="button"
                        v-for="item in verses"
                        v-bind:key="item.id"
                        role="tab"
                        v-bind:aria-label="item.title"
                        v-bind:aria-selected="item.id === session.selectedId"
                        v-bind:class="{ on: item.id === session.selectedId }"
                        v-on:click="select(item.id)"></button>
            </div>
        </div>
        <div class="cvDock tap95card">
            <div class="main95">
                <div class="cvCount">
                    <span class="tapNum">{{ count }}</span>
                    <div class="cvTapDots" aria-hidden="true">
                        <div v-for="(row, rowIndex) in dotRows" v-bind:key="rowIndex">
                            <span v-for="n in row"
                                  v-bind:key="n"
                                  v-bind:class="{ tapped: n <= count, five: n % 5 === 0 }"></span>
                        </div>
                    </div>
                    <div class="cvGroupDots" v-show="tapContinue" aria-hidden="true">
                        <div>
                            <span v-for="n in groupSlots"
                                  v-bind:key="n"
                                  v-bind:class="{ tapped: n < group, future: n > group }"
                                  v-bind:style="groupStyle(n)">{{ groupLabel(n) }}</span>
                        </div>
                    </div>
                </div>
                <button type="button"
                        class="primary circular big"
                        v-on:click="tap"
                        v-bind:disabled="tapBtnDisabled"
                        v-html="tapBtnText"
                        v-bind:title="'Tap to count ' + verse.title"></button>
            </div>
            <div class="tapControl">
                <div>
                    <button type="button" class="reset small light round" v-on:click="resetCount">Reset</button>
                    <span class="continue">
                        Continue past {{ verse.target }}?
                    </span>
                    <q-toggle v-model="tapContinue" />
                </div>
                <div class="cvPrefs">
                    <label><input type="checkbox" v-model="tapAuto">Auto</label>
                    <label><input type="checkbox" v-model="tapSounds">Sound</label>
                </div>
                <div class="tapDelayArea" v-bind:style="{ opacity: tapAuto ? 1 : 0.25 }">
                    <span>Auto
                        <span>{{ autoSeconds }}</span></span>
                    <q-range v-model="tapAutoDelay" v-bind:step="500" v-bind:min="1000" v-bind:max="15000"></q-range>
                </div>
            </div>
        </div>
        <audio v-bind:id="soundIds.step" preload="auto">
            <source src="/statics/each.mp3">
        </audio>
        <audio v-bind:id="soundIds.step19" preload="auto">
            <source src="/statics/each19.mp3">
        </audio>
        <audio v-bind:id="soundIds.end" preload="auto">
            <source src="/statics/each95.mp3">
        </audio>
    </article>
</template>
<style src="./CounterVerses.vue.css"></style>
<script src="./CounterVerses.vue.js"></script>
