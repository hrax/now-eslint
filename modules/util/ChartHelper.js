const {ChartJSNodeCanvas} = require("chartjs-node-canvas");


class ChartHelper {
  static chart(width, height, configuration) {
    const chartCallback = (chart) => {
      chart.defaults.font.family = "Calibri";
    };
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({width, height, chartCallback});
    chartJSNodeCanvas.registerFont(__dirname + "../../../resources/fonts/Calibri/Calibri.ttf", {family: "Calibri"});
    return chartJSNodeCanvas.renderToDataURLSync(configuration);
  }
}

module.exports = ChartHelper;