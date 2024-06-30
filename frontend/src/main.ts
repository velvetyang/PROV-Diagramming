import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import { Graph, Edge } from '@antv/x6';
// import "~/styles/element/index.scss";

// import ElementPlus from "element-plus";
// import all element css, uncommented next line
// import "element-plus/dist/index.css";

// or use cdn, uncomment cdn link in `index.html`

import "~/styles/index.scss";
import "uno.css";

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";

// 设置默认标签配置
Edge.config({
    defaultLabel: {
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "text",
            selector: "label",
          },
        ],
        attrs: {
          text: {
            text: "label",
            fill: "#000",
            fontSize: 14,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            pointerEvents: "none",
          },
          rect: {
            ref: "label",
            fill: "#fff",
            rx: 3,
            ry: 3,
            refWidth: 1,
            refHeight: 1,
            refX: 0,
            refY: 0,
          },
        },
        position: {
          distance: 0.5,
        },
      },
  });
  
  // 重新定义 parseStringLabel 方法来保证字符串标签的可用性
  Edge.parseStringLabel = (label: string) => {
    return {
      attrs: { 'label': { text: label } },
    };
  };
const pinia = createPinia()
const app = createApp(App);
// app.use(ElementPlus);
app.use(pinia)
app.mount("#app");
