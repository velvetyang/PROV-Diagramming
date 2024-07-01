<script setup>
import { toggleDark } from "~/composables";
import { Graph } from "@antv/x6";
import { useMainStore } from "~/store/index.js";
import { sendDataToServer } from '~/store/api.js';

const store = useMainStore();

const exportJSON = async() => {
  if (store.graph) {
    const graphData = store.graph.toJSON(); // 定义 graphData
    console.log(graphData, 'graph');

    const downloadUrl = await sendDataToServer(graphData); 
    if (downloadUrl) {
      window.location.href = downloadUrl; // 触发下载
    }
  } else {
    console.error('Graph is not initialized');
  }
};
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">
    <p class="menu-title" >PROV Design Tool</p>
    <div class="flex-grow" />
    <el-sub-menu index="2">
      <template #title>File</template>
      <el-sub-menu index="2-1">
        <template #title>Save as</template>
        <el-menu-item index="2-1-1" @click="exportJSON">JSON</el-menu-item>
        <el-menu-item index="2-1-2">PNG</el-menu-item>
        <el-menu-item index="2-1-3">SVG</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>Edit</template>
      <el-menu-item index="2-1">item one</el-menu-item>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
    </el-sub-menu>
    <el-menu-item h="full" @click="toggleDark()">
      <button
        class="border-none w-full bg-transparent cursor-pointer"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>
  </el-menu>
</template>

<style>
.menu-title {
  margin-left: 10px;
  width: 180px;
  color: rgb(100, 100, 110);
   /* 调整这个值来控制右移的距离 */
}
.flex-grow {
  flex-grow: 1; /* 菜单栏居右*/
}
</style>
