/**
 * 修剪 graph 数据，移除不需要的属性
 * @param {Object} data - 接收到的 graph 数据
 * @returns {Object} 修剪后的 graph 数据
 */
const trimGraphData = (data) => {
  if (!data.cells) return data;

  return {
    cells: data.cells.map(cell => {
      const {
        imageUrl,
        zIndex,
        ...trimmedCell
      } = cell;
      return trimmedCell;
    })
  };
};

/**
 * 初始化目标数据结构
 * @returns {Object} 初始化后的数据结构
 */
const initializeTransformedData = () => {
  return {
    prefix: {
      s: "http://schema.org/",
      ex: "http://example.com/"
    },
    entity: {},
    activity: {},
    agent: {},
    wasGeneratedBy: {},
    used: {},
    wasInformedBy: {},
    wasStartedBy: {},
    wasEndedBy: {},
    wasInvalidatedBy: {},
    wasDerivedFrom: {},
    wasAttributedTo: {},
    wasAssociatedWith: {},
    actedOnBehalfOf: {},
    wasInfluencedBy: {},
    specializationOf: {},
    alternateOf: {},
    hadMember: {}
  };
};

/**
 * 初始化全局计数器
 * @returns {Object} 初始化后的计数器对象
 */
const initializeGlobalCounter = () => ({
  counter: 1
});

/**
 * 创建节点 ID 映射
 * @param {Array} cells - 所有节点和边的数据
 * @returns {Object} 节点 ID 映射到节点标签文本的映射
 */
const createNodeIdMapping = (cells) => {
  const nodeIdMapping = {};
  cells.forEach(cell => {
    if (cell.shape === 'rect' || cell.shape === 'ellipse' || cell.shape === 'path') {
      nodeIdMapping[cell.id] = `ex:${cell.attrs.label.textWrap.text}`;
    }
  });
  return nodeIdMapping;
};

/**
 * 处理节点
 * @param {Object} node - 单个节点数据
 * @param {Object} transformedData - 目标数据结构
 */
const handleNode = (node, transformedData) => {
  let type;
  switch (node.shape) {
    case 'rect':
      type = 'entity';
      break;
    case 'ellipse':
      type = 'activity';
      break;
    case 'path':
      type = 'agent';
      break;
    default:
      throw new Error(`Unknown shape: ${node.shape}`);
  }

  const nodeName = `ex:${node.attrs.label.textWrap.text}`;

  const entity = {
    "prov:label": {},
    "prov:type": {
      "type": "prov:QUALIFIED_NAME"
    }
  };
  transformedData[type][nodeName] = entity;
};

/**
 * 处理边并分类
 * @param {Object} edge - 单个边数据
 * @param {Object} transformedData - 目标数据结构
 * @returns {Object} 分类后的边
 */
const categorizeEdges = (edges, nodeIdMapping) => {
  const edgeGroups = {
    wasGeneratedBy: [],
    wasDerivedFrom: [],
    used: [],
    wasAttributedTo: [],
    wasAssociatedWith: [],
    alternateOf: [],
    actedOnBehalfOf: [],
    wasStartedBy: [],
    wasInfluencedBy: [],
    wasEndedBy: [],
    specializationOf: []
  };
 

  edges.forEach(edge => {
    if (edge.shape === 'edge') {
      const sourceId = nodeIdMapping[edge.source.cell];
      const targetId = nodeIdMapping[edge.target.cell];

      let relationship = {};
      let relationshipType = 'used'; // 默认关系类型

      if (edge.labels && edge.labels.includes("wasGeneratedBy")) {
        relationship = {
          "prov:activity": sourceId,
          "prov:entity": targetId
        };
        relationshipType = 'wasGeneratedBy';
      } else if (edge.labels && edge.labels.includes("wasDerivedFrom")) {
        relationship = {
          "prov:usedEntity": sourceId,
          "prov:generatedEntity": targetId
        };
        relationshipType = 'wasDerivedFrom';
      } else if (edge.labels && edge.labels.includes("used")) {
        relationship = {
          "prov:activity": sourceId,
          "prov:entity": targetId
        };
        relationshipType = 'used';
      } else if (edge.labels && edge.labels.includes("wasAssociatedWith")) {
        relationship = {
          "prov:activity": sourceId,
          "prov:entity": targetId
        };
        relationshipType = 'wasAssociatedWith';
      } else if (edge.labels && edge.labels.includes("alternateOf")) {
        relationship = {
          "prov:alternate1": sourceId,
          "prov:alternate2": targetId
        };
        relationshipType = 'alternateOf';
      } else if (edge.labels && edge.labels.includes("actedOnBehalfOf")) {
        relationship = {
          "prov:delegate": sourceId,
          "prov:responsible": targetId
        };
        relationshipType = 'actedOnBehalfOf';
      } else if (edge.labels && edge.labels.includes("wasStartedBy")) {
        relationship = {
          "prov:activity": sourceId,
          "prov:trigger": targetId
        };
        relationshipType = 'wasStartedBy';
      } else if (edge.labels && edge.labels.includes("wasInfluencedBy")) {
        relationship = {
          "prov:influencee": sourceId,
          "prov:influencer": targetId
        };
        relationshipType = 'wasInfluencedBy';
      } else if (edge.labels && edge.labels.includes("wasEndedBy")) {
        relationship = {
          "prov:activity": sourceId,
          "prov:trigger": targetId
        };
        relationshipType = 'wasEndedBy';
      } else if (edge.labels && edge.labels.includes("specializationOf")) {
        relationship = {
          "prov:generalEntity": sourceId,
          "prov:specificEntity": targetId
        };
        relationshipType = 'specializationOf';
      } else {
        relationship = {
          "prov:entity": sourceId,
          "prov:agent": targetId
        };
        relationshipType = 'wasAttributedTo';
      }
      // 可以根据需要添加更多条件

      edgeGroups[relationshipType].push(relationship);
    }
  });

  return edgeGroups;
};

/**
 * 处理分类后的边
 * @param {Object} edgeGroups - 分类后的边
 * @param {Object} transformedData - 目标数据结构
 * @param {Object} globalCounter - 全局计数器
 */
const handleEdges = (edgeGroups, transformedData, globalCounter) => {
  Object.keys(edgeGroups).forEach(type => {
    if (edgeGroups[type].length > 0) {
      transformedData[type] = {};
      edgeGroups[type].forEach(rel => {
        const relationId = `_:id${globalCounter.counter++}`;
        transformedData[type][relationId] = rel;
      });
    }
  });
};

/**
 * 转换数据
 * @param {Object} inputData - 输入的 graph 数据
 * @returns {Object} 转换后的数据
 */
const transformData = (inputData) => {
  const transformedData = initializeTransformedData();
  const globalCounter = initializeGlobalCounter();
  const nodeIdMapping = createNodeIdMapping(inputData.cells);

  inputData.cells.forEach(cell => {
    if (cell.shape === 'rect' || cell.shape === 'ellipse' || cell.shape === 'path') {
      handleNode(cell, transformedData);
    }
  });

  const edgeGroups = categorizeEdges(inputData.cells, nodeIdMapping);
  handleEdges(edgeGroups, transformedData, globalCounter);

  // 移除空对象
  Object.keys(transformedData).forEach(key => {
    if (Object.keys(transformedData[key]).length === 0) {
      delete transformedData[key];
    }
  });

  return transformedData;
};

module.exports = {
  trimGraphData,
  transformData
};