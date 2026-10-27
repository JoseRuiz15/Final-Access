<script setup>
defineProps({
  active: { type: Boolean, default: false },
})
</script>

<template>
  <svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">
    <path
      d="M6 0h4v2h1v3h2v1h3v4h-3v1h-2v2h1v3H8v-2H7v2H3v-3h1v-2H2v-1H0V6h3V5h2V2h1z"
      fill="#101629"
      transform="translate(0 1)"
    />
    <path
      d="M6 0h4v2h1v3h2v1h3v4h-3v1h-2v2h1v3H8v-2H7v2H3v-3h1v-2H2v-1H0V6h3V5h2V2h1z"
      :fill="active ? '#e5a936' : '#3e4b64'"
    />
    <path
      d="M7 2h2v3h1v2h3v2h-3v1H9v3H7v-3H6V9H3V7h3V5h1z"
      :fill="active ? '#ffe996' : '#8190a8'"
    />
    <path
      d="M7 3h1v2H7zM6 6h1v1H6z"
      :fill="active ? '#fff8d5' : '#b6c1d1'"
    />
  </svg>
</template>
