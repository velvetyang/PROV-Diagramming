<template>
  <div class="dashboard-container">
    <div class="antvBox">
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
      <div class="canvas-card" @dragover="handleDragOver" @drop="handleDrop">
          <div id="container" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Graph } from "@antv/x6";
import img from "~/assets/logo.png"; // 确保图片路径正确

const moduleList = ref([
  { id: 1, name: "node1", img: img },
  { id: 8, name: "node2", img: img },
  { id: 2, name: "node3", img: img },
  { id: 3, name: "node4", img: img },
]);

const graph = ref(null);
let draggedItem = null;
const curSelectNode = ref(null);
const handleDragStart = (e, item) => {
  draggedItem = item;
};

const handleDragEnd = (e, item) => {
  // 这里不再需要执行任何操作
};

const handleDragOver = (e) => {
  e.preventDefault(); // 必须阻止默认行为以启用放置
};

const handleDrop = (e) => {
  e.preventDefault();
  if (draggedItem) {
    const containerRect = document
      .querySelector(".canvas-card")
      .getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    addHandleNode(
      x,
      y,
      new Date().getTime(),
      draggedItem.img,
      draggedItem.name
    );
    draggedItem = null; // 清除当前拖动的节点
  }
};

const addHandleNode = (x, y, id, image, name) => {
  graph.value.addNode({
    id: id,
    shape: "image",
    x: x,
    y: y,
    width: 60,
    height: 60,
    imageUrl: image,
    attrs: {
      body: {
        stroke: "#ffa940",
        fill: "#ffd591",
      },
      label: {
        textWrap: {
          width: 90,
          text: name,
        },
        fill: "black",
        fontSize: 12,
        refX: 0.5,
        refY: "100%",
        refY2: 4,
        textAnchor: "middle",
        textVerticalAnchor: "top",
      },
    },
    ports: {
      groups: {
        group1: {
          position: [30, 30],
        },
      },
      items: [
        {
          group: "group1",
          id: "port1",
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: "#ffffff",
              strokeWidth: 2,
              fill: "#5F95FF",
            },
          },
        },
      ],
    },
    zIndex: 10,
  });
};

const nodeAddEvent = () => {
  const container = document.getElementById("container");
  const changePortsVisible = (visible) => {
    const ports = container.querySelectorAll(".x6-port-body");
    for (let i = 0, len = ports.length; i < len; i++) {
      ports[i].style.visibility = visible ? "visible" : "hidden";
    }
  };

  graph.value.on("node:mouseenter", () => {
    changePortsVisible(true);
  });

  graph.value.on("node:mouseleave", () => {
    changePortsVisible(false);
  });

  // 节点绑定点击事件
  graph.value.on("node:click", ({ node }) => {
    console.log("点击", node);
    if (curSelectNode.value) {
      curSelectNode.value.removeTools();
      if (curSelectNode.value !== node) {
        node.addTools([
          {
            name: "boundary",
            args: {
              attrs: {
                fill: "#16B8AA",
                stroke: "#2F80EB",
                strokeWidth: 1,
                fillOpacity: 0.1,
              },
            },
          },
          {
            name: "button-remove",
            args: {
              x: "100%",
              y: 0,
              offset: {
                x: 0,
                y: 0,
              },
            },
          },
        ]);
        curSelectNode.value = node;
      } else {
        curSelectNode.value = null;
      }
    } else {
      curSelectNode.value = node;
      node.addTools([
        {
          name: "boundary",
          args: {
            attrs: {
              fill: "#16B8AA",
              stroke: "#2F80EB",
              strokeWidth: 1,
              fillOpacity: 0.1,
            },
          },
        },
        {
          name: "button-remove",
          args: {
            x: "100%",
            y: 0,
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
      ]);
    }
  });

  // 连线绑定悬浮事件
  graph.value.on("cell:mouseenter", ({ cell }) => {
    if (cell.shape === "edge") {
      cell.addTools([
        {
          name: "button-remove",
          args: {
            x: "100%",
            y: 0,
            offset: {
              x: 0,
              y: 0,
            },
          },
        },
      ]);
      cell.setAttrs({
        line: {
          stroke: "#409EFF",
        },
      });
      cell.zIndex = 99; // 保证当前悬停的线在最上层，不会被遮挡
    }
  });

  graph.value.on("cell:mouseleave", ({ cell }) => {
    if (cell.shape === "edge") {
      cell.removeTools();
      cell.setAttrs({
        line: {
          stroke: "black",
        },
      });
      cell.zIndex = 1; // 保证未悬停的线在下层，不会遮挡悬停的线
    }
  });
};

const initGraph = () => {
  const container = document.getElementById("container");
  graph.value = new Graph({
    container: container,
    width: container.offsetWidth,
    height: container.offsetHeight,
    background: {
        color: '#FAF9F6',
      },
    grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#eee', // 主网格线颜色
            thickness: 2, // 主网格线宽度
          },
          {
            color: '#ddd', // 次网格线颜色
            thickness: 3, // 次网格线宽度
            factor: 5, // 主次网格线间隔
          },
        ],
      },
    snapline: true,
    connecting: {
      snap: true,
      allowBlank: false,
      allowMulti: true,
      allowLoop: true,
      highlight: true,
      highlighting: {
        magnetAdsorbed: {
          name: "stroke",
          args: {
            attrs: {
              fill: "#5F95FF",
              stroke: "#5F95FF",
            },
          },
        },
      },
      router: {
        name: "orth",
      },
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },
    },
    panning: {
      enabled: false,
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
  });
  nodeAddEvent();
};

onMounted(() => {
  initGraph();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  .antvBox {
    display: flex;
    width: 100%;
    height: 100%;
    color: black;
    padding-top: 5px;
    .menu-list {
      height: 100%;
      width: 150px;
      padding: 0 10px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-content: flex-start;
      flex-wrap: wrap;
      > div {
        margin-bottom: 10px;
        border-radius: 5px;
        padding: 0 10px;
        box-sizing: border-box;
        cursor: pointer;
        color: black;
        width: 105px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        img {
          height: 50px;
          width: 50px;
        }
        p {
          width: 90px;
          text-align: center;
        }
      }
    }
    .canvas-card {
      width: 1700px;
      height: 600px;
      box-sizing: border-box;
      > div {
        width: 100%;
        height: 100%;
        border: 2px dashed #a0a0a0;
      }
    }
  }
}
</style>
