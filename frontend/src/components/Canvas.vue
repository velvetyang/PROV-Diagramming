<template>
  <div class="dashboard-container">
    <div class="antvBox">
      <div class="canvas-card" @dragover="handleDragOver" @drop="handleDrop">
        <div id="container" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMainStore } from "~/store/index.js";
import { Graph, Registry } from "@antv/x6";

const store = useMainStore();

const moduleList = store.moduleList;
const graph = ref(null);
const curSelectNode = ref(null);

const handleDragOver = (e) => {
  e.preventDefault(); // 必须阻止默认行为以启用放置
};

const handleDrop = (e) => {
  e.preventDefault();
  if (store.draggedItem) {
    const containerRect = document
      .querySelector(".canvas-card")
      .getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    const { shape, img, width, name, path } = store.draggedItem;

    addHandleNode(x, y, new Date().getTime(), shape, img, width, name, path);
    store.clearDraggedItem();
  }
};

//添加节点到画布上
const addHandleNode = (x, y, id, shape, image, width, name, path) => {
  const nodeName = store.generateNodeName(name);
  const attrs = {
    body: {
      stroke: shape === 'rect' ? 'blue' : shape === 'ellipse' ? '#808080' : '#ffa940',
      fill: shape === 'rect' ? '#9FB1FC' : shape === 'ellipse' ? '#FFFC87' : '#ffd591',
    },
    label: {
      textWrap: {
        width: 90,
        text: nodeName,
      },
      fill: "black",
      fontSize: 12,
      refX: 0.5,
      refY: 0.5,
      refY2: -4,
      textAnchor: "middle",
      textVerticalAnchor: "top",
    },
  };
 // 如果有 path 属性，直接添加到 attrs 中 --针对svg图形
  if (path) {
    attrs.path = {
      d: path,
      fill: "#FED37F",
      stroke: "#000000",
      strokeWidth: 2,
    };
    attrs.viewBox = {
      minX: 0,
      minY: 0,
      width: width,
      height: 30,
    };
  }

  


  graph.value.addNode({
    id: id,
    shape: shape,
    x: x,
    y: y,
    width: width,
    height: 60,
    imageUrl: image,
    attrs: attrs,
    ports: {
      groups: {
        group1: {
          position: [width / 2, 30], // 节点标志定位
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

//添加边到画布上
// const addEdge = (sourceId, targetId) => {
//   graph.value.addEdge({
//     source: { cell: sourceId },
//     target: { cell: targetId },
//     attrs: {
//       label: {
//         text: 'custom label', // 自定义标签文本
//       },
//     },
//   });
// };

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

// 编辑边的标签
const editEdgeLabel = (edge) => {
  const currentLabel = edge.getLabels()[0]?.attrs?.label?.text || ""; // 获取当前标签文本
  const input = document.createElement("input");
  input.value = currentLabel;

  const edgePosition = edge.getSourcePoint(); // 获取边的起点位置
  const containerRect = document
    .querySelector(".canvas-card")
    .getBoundingClientRect();

  input.style.position = "absolute";
  input.style.left = `${edgePosition.x + containerRect.left - input.offsetWidth / 2 + 180}px`; // 调整left值
  input.style.top = `${edgePosition.y + containerRect.top}px`; // 调整top值
  input.style.zIndex = 1000;
  input.style.width = "100px"; // 可以根据需要调整输入框的宽度
  input.style.fontSize = "12px"; // 确保字体大小与标签一致
  document.body.appendChild(input);

  input.focus();

  input.onblur = () => {
    edge.setLabels([input.value]); // 使用语法糖直接设置标签文本
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
    console.log("点击！！！", node);
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
              onClick: () => {
                const nodeName = node.attr("label/textWrap/text");
                const nodeType = nodeName.replace(/[0-9]/g, ""); // 提取类型名
                store.resetCount(nodeType); // 重置计数器
                graph.value.removeNode(node.id); // 使用 removeNode 函数删除节点
                console.log(`Node ${node.id} removed.`);
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
            onClick: () => {
              const nodeName = node.attr("label/textWrap/text");
              const nodeType = nodeName.replace(/[0-9]/g, ""); // 提取类型名
              store.resetCount(nodeType); // 重置计数器
              graph.value.removeNode(node.id); // 使用 removeNode 函数删除节点
              console.log(`Node ${node.id} removed.`);
            },
          },
        },
      ]);
    }
  });
  //右键修改节点名和边名
  graph.value.on("node:contextmenu", ({ node }) => {
    editNodeLabel(node);
  });

  graph.value.on("edge:contextmenu", ({ edge }) => {
    editEdgeLabel(edge);
  });

  // 连线绑定悬浮事件，鼠标进入可以删除节点间连线
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
      //连接规则
      connectionPoint: {
      name: 'boundary',
      args: {
        extrapolate: true,
      },
    },
      snap: true,
      allowBlank: true,
      allowMulti: true,
      allowLoop: false, // 不允许创建循环连线
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
        name: "manhattan",
        args: {
          fallbackRouter: Registry.Router.presets.er,
        },
      },
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },
      createEdge() {
        return graph.value.createEdge({
          shape: "edge",
          labels: [
            {
              attrs: {
                label: {
                  text: "label",
                  fill: "#000000",
                },
              },
              position: {
                distance: 0.5, // Position at the middle of the edge
                offset: { x: -10, y: -20 }, // Offset the label slightly above the edge
              },
            },
          ],
          attrs: {
            line: {
              stroke: "#8f8f8f",
              strokeWidth: 1,
            },
          },
        });
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
  store.setGraph(graph.value); // 将 graph 实例存储到全局状态
  nodeAddEvent();
};

//加载并显示初始JSON文件内容
const loadInitialGraph = async () => {
  try {
    const response = await fetch("/origin.json");
    if (!response.ok) {
      throw new Error("Failed to load origin.json");
    }
    const data = await response.json();
    graph.value.fromJSON(data);
  } catch (error) {
    console.error("Error loading initial graph:", error);
  }
};

onMounted(() => {
  initGraph();
  loadInitialGraph(); // 加载并显示初始JSON文件内容
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

    .canvas-card {
      margin-left: 160px; // 为了避免侧边栏覆盖，画布左边留出足够的空间
      width: calc(100% - 160px); // 减去侧边栏的宽度
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
