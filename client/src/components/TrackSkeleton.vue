<template>
  <tr class="row">
    <td class="cell"><div class="block sm"></div></td>
    <td class="cell"><div class="block"></div></td>
    <td class="cell"><div class="block short"></div></td>
    <td class="cell"></td>
  </tr>
</template>

<script setup lang="ts"></script>

<style scoped>
.cell {
  padding: var(--s-xs) var(--s-sm);
  border-bottom: 1px solid #bbb;
}

.block {
  height: 10px;
  background: #b0b0b0;
  animation: blink 1s steps(2) infinite;
}

.block.sm {
  width: 24px;
  height: 24px;
}

.block.short {
  width: 60%;
}

@keyframes blink {
  50% { opacity: 0.4; }
}
</style>
