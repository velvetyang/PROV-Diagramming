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
import rectImg from '~/assets/rect.svg';
import ellipseImg from '~/assets/ellipse.svg';
import logoImg from '~/assets/logo.png';

const moduleList = ref([
  { id: 1, name: "node1", img: rectImg, shape: "rect", width: 100 },
  { id: 2, name: "node2", img: ellipseImg, shape: "ellipse", width: 150 },
  { id: 3, name: "node3", img: logoImg, shape: "image", width: 100 },
  { id: 4, name: "node4", img: logoImg, shape: "image", width: 100 },
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
    // 判定节点形状
    let shape = "rect"; // 默认形状
    if (draggedItem.name === "node1") {
      shape = "rect";
    } else if (draggedItem.name === "node2") {
      shape = "ellipse";
    } else if (draggedItem.name === "node3") {
      shape = "image";
    }

    addHandleNode(
      x,
      y,
      new Date().getTime(),
      draggedItem.shape,
      draggedItem.img,
      draggedItem.width,
      draggedItem.name
    );
    draggedItem = null; // 清除当前拖动的节点
  }
};

//添加节点到画布上
const addHandleNode = (x, y, id, shape, image, width, name) => {
  graph.value.addNode({
    id: id,
    shape: shape,
    x: x,
    y: y,
    width: width,
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
        refY: 0.5,
        refY2: -4,
        textAnchor: "middle",
        textVerticalAnchor: "top",
      },
    },
    ports: {
      groups: {
        group1: {
          position: [width/2, 30], // 节点标志定位
          // args: { x: '50%', y: '50%' } // 居中位置
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

//编辑节点标签
const editNodeLabel = (node) => {
  const currentLabel = node.attr("label/textWrap/text");
  const input = document.createElement("input");
  input.value = currentLabel;

  const nodePosition = node.position();
  const labelAttrs = node.attr("label");
  const labelX = labelAttrs.refX * node.size().width + 80;
  const labelY = labelAttrs.refY * node.size().height;

  input.style.position = "absolute";
  input.style.left = `${nodePosition.x + labelX - input.offsetWidth / 2}px`; // 调整left值
  input.style.top = `${nodePosition.y + labelY}px`; // 调整top值
  input.style.zIndex = 1000;
  input.style.width = "100px"; // 可以根据需要调整输入框的宽度
  input.style.fontSize = "12px"; // 确保字体大小与节点标签一致
  document.body.appendChild(input);

  input.focus();

  input.onblur = () => {
    node.setAttrs({
      label: {
        textWrap: {
          text: input.value,
        },
      },
    });
    document.body.removeChild(input);
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      input.blur();
    }
  };
};

//鼠标移入节点再显示连接桩
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
          name: "button-remove", //删除按钮
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

  graph.value.on("node:contextmenu", ({ node }) => {
    editNodeLabel(node);
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
      color: "#FAF9F6",
    },
    grid: {
      visible: true,
      type: "doubleMesh",
      args: [
        {
          color: "#eee", // 主网格线颜色
          thickness: 2, // 主网格线宽度
        },
        {
          color: "#ddd", // 次网格线颜色
          thickness: 3, // 次网格线宽度
          factor: 5, // 主次网格线间隔
        },
      ],
    },
    snapline: true,
    translating: {
      restrict: true, //节点移动时不可以移出画布
    },
    connecting: {
      snap: true,
      allowBlank: false,
      allowMulti: true,
      allowLoop: false, // 禁止创建循环连线
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
