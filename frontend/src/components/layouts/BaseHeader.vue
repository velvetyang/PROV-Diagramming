<script setup>
import { toggleDark } from "~/composables";
import { useMainStore } from "~/store/index.js";
import { sendDataToServer, sendImageToServer } from "~/store/api.js";
import { ElMessage } from "element-plus";
import html2canvas from "html2canvas";

const store = useMainStore();

const saveToLocalStorage = () => {
  if (store.graph) {
    const graphData = store.graph.toJSON();
    localStorage.setItem("savedGraphData", JSON.stringify(graphData));
    ElMessage({
      message: "Graph data saved to localStorage.",
      type: "success",
      plain: true,
    });
  } else {
    ElMessage({
      message: "Graph is not initialized",
      type: "error",
      plain: true,
    });
  }
};

const recoverFromLocalStorage = () => {
  const savedGraphData = localStorage.getItem("savedGraphData");
  if (savedGraphData) {
    const graphData = JSON.parse(savedGraphData);
    store.graph.fromJSON(graphData); // 加载并显示保存的 graphData
    ElMessage({
      message: "Graph data recovered from localStorage.",
      type: "success",
      plain: true,
    });
  } else {
    ElMessage({
      message: "No saved graph data found in localStorage",
      type: "error",
      plain: true,
    });
  }
};
const exportJSON = async () => {
  if (store.graph) {
    const graphData = store.graph.toJSON(); // 定义 graphData

    const downloadUrl = await sendDataToServer(graphData);
    if (downloadUrl) {
      window.location.href = downloadUrl; // 触发下载
    }
  } else {
    ElMessage({
      message: "Graph is not initialized.",
      type: "error",
      plain: true,
    });
  }
};
// 导出 SVG
const exportSVG = async () => {
  if (store.graph) {
    const container = document.getElementById("container");

    // 创建一个 SVG 容器
    let svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgContainer.setAttribute('version', '1.1');
    svgContainer.setAttribute('height', container.offsetHeight);
    svgContainer.setAttribute('width', container.offsetWidth);

    // 使用 html2canvas 捕获画布内容并生成 PNG
    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL('image/png');

    // 将 PNG 转换为 SVG 格式
    let imgElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imgElement.href.baseVal = imgData;
    imgElement.setAttribute('height', container.offsetHeight);
    imgElement.setAttribute('width', container.offsetWidth);

    // 将图片元素添加到 SVG 容器中
    svgContainer.appendChild(imgElement);

    // 生成完整的 SVG 数据
    const svgData = svgContainer.outerHTML;

    try {
      const response = await sendImageToServer({ svg: svgData });
      if (response) {
        window.location.href = response; // 触发下载
        ElMessage({
          message: 'Graph exported as SVG.',
          type: 'success',
          plain: true,
        });
      } else {
        ElMessage({
          message: 'Failed to export SVG.',
          type: 'error',
          plain: true,
        });
      }
    } catch (error) {
      ElMessage({
        message: `Error exporting SVG: ${error.message}`,
        type: 'error',
        plain: true,
      });
    }
  } else {
    ElMessage({
      message: 'Graph is not initialized.',
      type: 'error',
      plain: true,
    });
  }
};


//导出 PNG
const exportPNG = async () => {
  if (store.graph) {
    const container = document.getElementById("container");
    const canvas = await html2canvas(container);
    const pngData = canvas.toDataURL("image/png");

    try {
      const downloadUrl = await sendImageToServer({ png: pngData });
      if (downloadUrl) {
        window.location.href = downloadUrl; // 触发下载
        ElMessage({
          message: "Graph exported as PNG.",
          type: "success",
          plain: true,
        });
      } else {
        ElMessage({
          message: "Failed to export PNG.",
          type: "error",
          plain: true,
        });
      }
    } catch (error) {
      ElMessage({
        message: `Error exporting PNG: ${error.message}`,
        type: "error",
        plain: true,
      });
    }
  } else {
    ElMessage({
      message: "Graph is not initialized.",
      type: "error",
      plain: true,
    });
  }
};
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal">
    <p class="menu-title">PROV Design Tool</p>
    <div class="flex-grow" />
    <el-sub-menu index="2">
      <template #title>File</template>
      <el-sub-menu index="2-1">
        <template #title>Export as</template>
        <el-menu-item index="2-1-1" @click="exportJSON">JSON</el-menu-item>
        <el-menu-item index="2-1-2" @click="exportPNG">PNG</el-menu-item>
        <!-- <el-menu-item index="2-1-3" @click="exportSVG">SVG</el-menu-item> -->
      </el-sub-menu>
      <el-menu-item index="2-2" @click="saveToLocalStorage">Save</el-menu-item>
      <el-menu-item index="2-3" @click="recoverFromLocalStorage"
        >Recover Last Session
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="3"
      ><a
        href="https://www.w3.org/TR/prov-overview/"
        target="_blank"
        style="text-decoration: none; color: inherit"
        >Help</a
      ></el-menu-item
    >
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
