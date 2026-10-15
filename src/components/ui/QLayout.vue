<template>
  <div class="q-layout layout">
    <div class="layout-header">
      <slot name="header"></slot>
    </div>
    <div class="layout-content">
      <slot></slot>
    </div>
    <div class="layout-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
