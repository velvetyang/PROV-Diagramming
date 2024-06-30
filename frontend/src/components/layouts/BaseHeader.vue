<script setup>
import { toggleDark } from "~/composables";
import { Graph } from "@antv/x6";
import { useMainStore } from "~/store/index.js";

const store = useMainStore();

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2); // 格式化 JSON 字符串
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
 

  URL.revokeObjectURL(url); // 释放 URL 对象
}

const exportJSON = () => {
  if (store.graph) {
    console.log(store.graph.toJSON(), 'graph');
    downloadJSON(store.graph.toJSON(),"graph.json");
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
