// src/store/index.js
import { defineStore } from 'pinia';
import { Graph } from '@antv/x6';

export const useMainStore = defineStore('main', {
  state: () => ({
    moduleList: [
      { id: 1, name: "Activity", img: new URL('~/assets/rect.svg', import.meta.url).href, shape: "rect", width: 100 },
      { id: 2, name: "Entity", img: new URL('~/assets/ellipse.svg', import.meta.url).href, shape: "ellipse", width: 150 },
      { id: 3, name: "Agent", img: new URL('~/assets/agent.svg', import.meta.url).href, shape: "path", width: 100, path:'M -30 20 L 50 -20 L 130 20 V 50 H -30 Z'},
      // { id: 4, name: "node4", img: new URL('~/assets/logo.png', import.meta.url).href, shape: "image", width: 100 },
    ],
    draggedItem: null,
    graph: null, //  公共变量graph  
  }),
  actions: {
    setGraph(graphInstance) {
      this.graph = graphInstance;
    },
    clearGraph() {
      this.graph = null;
    },
    setDraggedItem(item) {
      this.draggedItem = item;
    },
    clearDraggedItem() {
      this.draggedItem = null;
    },
  },
});
