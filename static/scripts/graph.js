// Set data
var waterData = {};
let spinnerWrapper = document.querySelector('.spinner-border');

fetch('/getWaterData')
    .then(function (response) {
        return response.json();
    }).then(function (text) {
    waterData = text;
    spinnerWrapper.style.display = 'none';
    am5.ready(
        function () {
            // Create root element
            // https://www.amcharts.com/docs/v5/getting-started/#Root_element
            var root = am5.Root.new("chartdiv");

            // Set themes
            // https://www.amcharts.com/docs/v5/concepts/themes/
            root.setThemes([
                am5themes_Animated.new(root)
            ]);

            // Create chart
            // https://www.amcharts.com/docs/v5/charts/xy-chart/
            var chart = root.container.children.push(am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX"
            }));

            // Add cursor
            // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
            var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                behavior: "none"
            }));
            cursor.lineY.set("visible", false);
            //cursor.lineX.set("forceHidden", true);
            //cursor.lineY.set("forceHidden", true);

            // Generate data
            var date = new Date(0);
            date.setUTCSeconds(waterData[0].Epoch - 3600);

            var value = 0;
            var topBound = 0;
            var bottomBound = 0;

            //fill data list with data received from data table
            //for last 5 data points, use predictions
            function generateData(inputNum) {
                console.log(inputNum);
                if (inputNum == waterData.length) {
                    value = waterData[waterData.length - 1]['t+1'];
                    topBound = value + 30;
                    bottomBound = value - 30;
                } else if (inputNum == waterData.length + 1) {
                    value = waterData[waterData.length - 1]['t+2'];
                    topBound = value + 40;
                    bottomBound = value - 40;
                } else if (inputNum == waterData.length + 2) {
                    value = waterData[waterData.length - 1]['t+3'];
                    topBound = value + 50;
                    bottomBound = value - 50;
                } else if (inputNum == waterData.length + 3) {
                    value = waterData[waterData.length - 1]['t+4'];
                    topBound = value + 60;
                    bottomBound = value - 60;
                } else if (inputNum == waterData.length + 4) {
                    value = waterData[waterData.length - 1]['t+5'];
                    topBound = value + 70;
                    bottomBound = value - 70;
                } else {
                    value = waterData[inputNum]["flow"];
                }
                console.log(value);

                am5.time.add(date, "hour", 1);
                if (inputNum < waterData.length) {
                    if (inputNum == waterData.length - 1) {
                        return {
                            date: date.getTime(),
                            value: value,
                            value2: value,
                            topBound: value + 1,
                            bottomBound: value - 1
                        };
                    } else {
                        return {
                            date: date.getTime(),
                            value: value,
                            value2: null,
                            topBound: null,
                            bottomBound: null
                        };
                    }

                } else {
                    return {
                        date: date.getTime(),
                        value: null,
                        value2: value,
                        topBound: topBound,
                        bottomBound: bottomBound
                    };
                }

            }

            //generate data from data table
            //add another 5 data points to end for predictions
            function generateDatas(count) {
                var data = [];
                for (var i = 0; i < count + 5; i++) {
                    data.push(generateData(i));

                }
                return data;
            }

            // Create axes
            // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
            var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
                baseInterval: {
                    timeUnit: "hour",
                    count: 1
                },
                maxDeviation: 0.5,
                renderer: am5xy.AxisRendererX.new(root, {})
            }));

            var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                renderer: am5xy.AxisRendererY.new(root, {})
            }));

            var pastTip = am5.Tooltip.new(root, {
                getFillFromSprite: false,
                labelText: "Flow: {valueY}"
            });

            pastTip.get("background").setAll({
                fill: am5.color(0x0669f9),
                opacity: 0.7
            });

            // Add pastSeries
            // https://www.amcharts.com/docs/v5/charts/xy-chart/pastSeries/
            var pastSeries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: "Series",
                maxDeviation: 0.7,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                valueXField: "date",
                stroke: am5.color(0x0669f9),
                tooltip: pastTip
            }));

            //add prediction series
            var predSeries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: "Series 2",
                xAxis: xAxis,
                yAxis: yAxis,

                valueYField: "value2",
                valueXField: "date",
                stroke: am5.color(0xf5a40a)

            }));


            //add tooltip for bottom end of prediction
            var bottomTip = am5.Tooltip.new(root, {
                getFillFromSprite: false,
                labelText: "Min likely flow: {valueY}"
            });

            bottomTip.get("background").setAll({
                fill: am5.color(0xf5a40a),
                opacity: 0.7
            });
            //add bottom bound of prediction range
            var bottomSeries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: "Bottom Bound",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "bottomBound",
                valueXField: "date",
                stroke: am5.color(0xf5da35),
                fill: am5.color(0xf5da35),
                tooltip: bottomTip

            }));

            //add tooltip for top end of prediction
            var topTip = am5.Tooltip.new(root, {
                getFillFromSprite: false,
                labelText: "Max likely flow: {valueY}"
            });
            topTip.get("background").setAll({
                fill: am5.color(0xf5a40a),
                opacity: 0.7
            });
            //add top bound of prediction range
            var topSeries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
                name: "Top Bound",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "topBound",
                openValueYField: "bottomBound",
                valueXField: "date",
                stroke: bottomSeries.get("stroke"),
                fill: bottomSeries.get("stroke"),
                tooltip: topTip

            }));


            //designs for past series
            pastSeries.strokes.template.setAll({
                strokeWidth: 3
            });

            topSeries.fills.template.setAll({
                fillOpacity: 0.3,
                visible: true

            });
            topSeries.strokes.template.setAll("strokeWidth", 1);


            bottomSeries.strokes.template.setAll("strokeWidth", 1);

            predSeries.strokes.template.setAll({
                strokeDasharray: [2, 2],
                strokeWidth: 3
            });


            // Add scrollbar
            // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
            chart.set("scrollbarX", am5.Scrollbar.new(root, {
                orientation: "horizontal"
            }));

            //Add data
            var data = generateDatas(waterData.length);
            pastSeries.data.setAll(data);
            predSeries.data.setAll(data);
            topSeries.data.setAll(data);
            bottomSeries.data.setAll(data);

            // Make stuff animate on load
            // https://www.amcharts.com/docs/v5/concepts/animations/
            pastSeries.appear(1000);
            predSeries.appear(1000);
            chart.appear(1000, 100);
        }); // end am5.ready()
});