<template>
  <div class="error-page window-height window-width bg-light column items-center">
    <div class="error-code bg-primary flex items-center justify-center">
      404
    </div>
    <div>
      <div class="error-card card column items-center justify-center">
        <i class="text-grey-5" aria-hidden="true">error_outline</i>
        <h1 class="caption text-center" data-page-heading>Oops. Nothing here...</h1>
        <p class="text-center group">
          <button v-if="canGoBack" class="grey push small" @click="goBack">
            <i class="on-left" aria-hidden="true">keyboard_arrow_left</i>
            Go back
          </button>
          <button class="grey push small" @click="$router.push('/')">
            Go home
            <i class="on-right" aria-hidden="true">home</i>
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404',
  data () {
    return {
      name: 'Not found',
      canGoBack: window.history.length > 1
    }
  },
  methods: {
    goBack () {
      window.history.go(-1)
    }
  }
}
</script>

<style>
.error-page .error-code {
  height: 100vh;
  width: 100%;
  padding-top: 15vh;
  font-size: 30vmax;
  color: rgba(255, 255, 255, .2);
  overflow: hidden;
  position: absolute;
}
.error-page .error-card {
  margin-top: -25px;
  width: 90vw;
  max-width: 600px;
  padding: 50px;
  box-shadow: none;
}
.error-page h1.caption {
  font-size: 16px;
  font-weight: normal;
  letter-spacing: normal;
  line-height: inherit;
  margin: 0 0 1rem;
}
.error-page .error-card i {
  font-size: 5rem;
}
</style>
