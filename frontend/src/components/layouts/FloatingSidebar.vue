<template>
    <div class="menu-list">
      <div
        v-for="item in moduleList"
        :key="item.id"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd($event, item)"
      >
        <img :src="item.img" alt="" />
        <p>{{ item.name }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useMainStore } from '~/store/index.js';
  
  const store = useMainStore();
  
  const moduleList = store.moduleList;
  
  const handleDragStart = (e, item) => {
    store.setDraggedItem(item);
  };
  
  const handleDragEnd = (e, item) => {
    store.clearDraggedItem();
  };
  </script>
  
  <style lang="scss" scoped>
  .menu-list {
    position: fixed;
    left: 0;
    top: calc(var(--ep-menu-item-height) + 8px); // 向下移动一些距离
    width: 150px;
    height: calc(100vh - var(--ep-menu-item-height) - 10px); // 调整高度以适应顶部的额外空间
    overflow-y: auto;
    padding: 10px;
    box-sizing: border-box;
    background-color: white; // 设置背景颜色
    border-right: 1px solid #ddd; // 设置右侧分隔线
    border-top: 1px solid #ddd; // 添加顶部边界

    > div {
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd; // 为每个元素添加分隔线
      padding: 10px;
      cursor: pointer;
      color: black;
      display: flex;
      flex-direction: column;
      align-items: center;

      img {
        height: 30px;
        width: 30px;
      }

      p {
        margin-top: 5px;
        text-align: center;
      }
    }
  }
  </style>
  