<script setup>
import { toggleDark } from "~/composables";
import { Graph } from "@antv/x6";
import { useMainStore } from "~/store/index.js";
import { sendDataToServer } from '~/store/api.js';

const store = useMainStore();

const saveToLocalStorage = () => {
  if (store.graph) {
    const graphData = store.graph.toJSON(); // 获取当前画布的数据
    localStorage.setItem('savedGraphData', JSON.stringify(graphData)); // 保存到 localStorage
    console.log('Graph data saved to localStorage.');
  } else {
    console.error('Graph is not initialized');
  }
};
const recoverFromLocalStorage = () => {
  const savedGraphData = localStorage.getItem('savedGraphData');
  if (savedGraphData) {
    const graphData = JSON.parse(savedGraphData);
    store.graph.fromJSON(graphData); // 加载并显示保存的 graphData
    console.log('Graph data recovered from localStorage.');
  } else {
    console.error('No saved graph data found in localStorage');
  }
};
const exportJSON = async() => {
  if (store.graph) {
    const graphData = store.graph.toJSON(); // 定义 graphData

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
        <template #title>Export as</template>
        <el-menu-item index="2-1-1" @click="exportJSON">JSON</el-menu-item>
        <el-menu-item index="2-1-2">PNG</el-menu-item>
        <el-menu-item index="2-1-3">SVG</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="2-2" @click="saveToLocalStorage">Save</el-menu-item>
      <el-menu-item index="2-3" @click="recoverFromLocalStorage">Recover Last Session </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="3"><a href="https://www.w3.org/TR/prov-overview/" target="_blank" style="text-decoration: none; color: inherit;">Help</a></el-menu-item>
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
  flex-grow: 0; /* 菜单栏居右*/
}
</style>
