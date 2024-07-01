/**
 * 修剪 graph 数据，移除不需要的属性
 * @param {Object} data - 接收到的 graph 数据
 * @returns {Object} 修剪后的 graph 数据
 */
const trimGraphData = (data) => {
    if (!data.cells) return data;
    
    return {
      cells: data.cells.map(cell => {
        const { imageUrl, zIndex, ...trimmedCell } = cell;
        return trimmedCell;
      })
    };
  };
  
  module.exports = {
    trimGraphData,
  };
  