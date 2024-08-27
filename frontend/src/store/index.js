// src/store/index.js
import { defineStore } from 'pinia';
import { Graph } from '@antv/x6';

export const useMainStore = defineStore('main', {
  state: () => ({
    moduleList: [
      { id: 1, name: "activity", img: new URL('~/assets/rect.svg', import.meta.url).href, shape: "rect", width: 100 },
      { id: 2, name: "entity", img: new URL('~/assets/ellipse.svg', import.meta.url).href, shape: "ellipse", width: 150 },
      { id: 3, name: "agent", img: new URL('~/assets/agent.svg', import.meta.url).href, shape: "path", width: 100, path:'M -30 20 L 50 -20 L 130 20 V 50 H -30 Z'},
      // { id: 4, name: "node4", img: new URL('~/assets/logo.png', import.meta.url).href, shape: "image", width: 100 },
    ],
    draggedItem: null,
    graph: null, //  公共变量graph  
    entityCount: 1,
    agentCount: 1,
    activityCount: 1,
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
    generateNodeName(name) {
      let count = 0;
      if (name === 'entity') {
        this.entityCount += 1;
        count = this.entityCount;
      } else if (name === 'agent') {
        this.agentCount += 1;
        count = this.agentCount;
      } else if (name === 'activity') {
        this.activityCount += 1;
        count = this.activityCount;
      }
      return `${name}${count}`;
    },
    resetCount(name) {
      if (name === 'entity') {
        this.entityCount = 0;
      } else if (name === 'agent') {
        this.agentCount = 0;
      } else if (name === 'activity') {
        this.activityCount = 0;
      }
    },
  },
  });
