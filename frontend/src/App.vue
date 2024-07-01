<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="main-container">
      <div class="flex-container">
        <FloatingSidebar />
        <div w="full" py="4">
          <Canvas />
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup>
import BaseHeader from '~/components/layouts/BaseHeader.vue';
import FloatingSidebar from '~/components/layouts/FloatingSidebar.vue';
import Canvas from '~/components/Canvas.vue';
import { createPinia } from 'pinia';
import { useMainStore } from '~/store/index.js';

const pinia = createPinia();
useMainStore(pinia);

</script>

<style>
.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
  display: flex;
  flex-direction: column;
}

.flex-container {
  display: flex;
  height: 100%;
}
</style>
