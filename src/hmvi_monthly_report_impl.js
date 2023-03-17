const colorGood = '#7cc576';
const colorBad = '#f26c4f';
const colorNeutral = '#6dcff6';
const colorGrey = '#3c3c3c';
const colorHighlight = '#FFFF00';
let forecast_horizon = 12

function transform_map_data(map_data) {
  //The incoming data use keys latitude/longitude;
  //Highcharts expects lat/lon with no apparent easy way to provide new names

  map_data = map_data.map(({ latitude: lat, longitude: lon, ...rest }) => {
    return ({
      lat,
      lon,
      ...rest,
    })}
  )

  //There appears to be no way to provide a "radius" key
  map_data = map_data.map(function (point) {
    //Metro areas have a population of 50000, at minimum
    //50000/300000000 = .0001
    //250000/300000000 = .0008
    r = Math.sqrt(point.pct_population)
    r = r * 100
    r = Math.min(Math.max(r, 1), 7)
    point['marker'] = { ...point['marker'], radius: r}
    return point;
  })

  return map_data
}

function map_data_sort_by(map_data, metric_name){
  map_data.sort((a, b) => (a[metric_name] < b[metric_name] ? 1 : -1))
  return map_data;
}

function transform_bar_chart_data(
  barchart_data,
  metric_name = 'market_performance_pctl',
) {
  //Extract the "effective" metric based on 'Rank By" criteria and sort descending

  barchart_data = barchart_data.map(function (place) {
    retval = { name: place.place_name, y: place[metric_name] }
    retval = { ...retval, ...place }
    return retval
  })

  return barchart_data
}

function getPlaceTooltip(point) {
  var tt =
    '<b>' +
    point.place_name +
    '</b><br>' +
    '<br>Market Performance Rank: <b>' +
    point.market_performance_rank +
    '</b> (' +
    point.market_performance_pctl +
    ' pctl)' +
    '<br>Situation: <b>' +
    point.situation +
    '</b> (' +
    point.situation_pctl +
    ' pctl)' +
    '<br>Outlook: <b>' +
    point.outlook +
    ' </b>(' +
    point.outlook_pctl +
    ' pctl)' +
    '<br>Forecasted appreciation: <b>' +
    point.forecasted_appreciation +
    '% </b>'
  return tt
}

function createUSExplorer(
  container_name,
  hmvi_time,
  hmvi_us,
  hmvi_us_chg,
  hmvi_num_states_trend_up,
  hmvi_num_states_outperforming,
  hmvi_pct_metro_trend_up,
  hmvi_pct_metro_outperforming,
) {

  var forecast_start_index = hmvi_time.length - forecast_horizon
  var forecast_end_index = hmvi_time.length - 1
  Highcharts.chart('us_chart', {
    navigator: {
      /*
  We are using Highcharts Navigator without using HighStock
  The navigator appears to get the index into the xaxis, so we explicity
  return  the formatted date.
  */
      enabled: true,
      margin: 5,
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            return Highcharts.dateFormat('%b %Y', hmvi_time[this.value])
          },
        },
      },
    },
    xAxis: {
      type: 'datetime',
      categories: hmvi_time,
      plotBands: [
        {
          color: '#FCFFC5',
          from: forecast_start_index,
          to: forecast_end_index,
        },
      ],
      labels: {
        format: '{value: %b %Y}',
        step: 6,
        rotation: 270,
      },
      crosshair: {
        width: 1,
        color: 'gray',
        dashStyle: 'shortdot',
      },
      offset: 5,
      endOnTick: false,
      startOnTick: false,
    },
    yAxis: [
      {
        offset: 5,
        title: {
          text: 'Monthly level',
          offset: 40,
        },
        height: '25%',
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05,
      },
      {
        offset: 5,
        title: {
          text: '12-month change',
          offset: 40,
        },
        top: '27%',
        height: '25%',
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05,
      },
      {
        offset: 5,
        title: {
          text: '# States',
          offset: 40,
        },
        min: 0,
        max: 51,
        top: '54%',
        height: '20%',
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05,
      },
      {
        offset: 5,
        title: {
          text: '% Metros',
          offset: 40,
        },
        min: 0,
        max: 100,
        top: '76%',
        height: '20%',
        lineWidth: 1,
        startOnTick: false,
        endOnTick: false,
        maxPadding: 0.05,
      },
    ],
    series: [
      {
        type: 'spline',
        name: 'Monthly level',
        label: '',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },

        data: hmvi_us,
        zones: [
          {
            value: 100,
            color: colorBad,
          },
          {
            value: 1000,
            color: colorGood,
          },
        ],
        showInNavigator: true,
      },
      {
        type: 'spline',
        name: '12-month change',
        label: '',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },

        data: hmvi_us_chg,
        zones: [
          {
            value: 0,
            color: colorBad,
          },
          {
            value: 1000,
            color: colorGood,
          },
        ],
        yAxis: 1,
      },
      {
        type: 'line',
        name: '# States Trending Up',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },
        data: hmvi_num_states_trend_up,
        color: colorNeutral,
        yAxis: 2,
      },
      {
        type: 'line',
        name: '# States Outperforming',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },
        data: hmvi_num_states_outperforming,
        color: colorGood,
        yAxis: 2,
      },
      {
        type: 'line',
        name: '% Metros Trending Up',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },
        data: hmvi_pct_metro_trend_up,
        color: colorNeutral,
        yAxis: 3,
      },
      {
        type: 'line',
        name: '% Metros Outperforming',
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
        },
        data: hmvi_pct_metro_outperforming,
        color: colorGood,
        yAxis: 3,
      },
    ],
    tooltip: {
      shared: true,
      crosshair: true,
      followPointer: true,
      xDateFormat: '%B %Y',
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    chart: {
      animation: false,
    },
  })
}


function createExplorerMap(
  map_container_name,
  map_data,
  report_prefix,
  topology,
  option,
) {
  map_data = transform_map_data(map_data)

  state_chart = Highcharts.mapChart(map_container_name, {
    chart: {
      map: topology,
    },
    plotOptions: {
      mappoint: {
        stickyTracking: false,
      },
      map: {
        colorByPoint: true,
        mapData: Highcharts.maps['countries/us/us-all'],
      },
      series: {
        point: {
          events: {
            click: function (event) {
              report_url = report_prefix + event.point.place_id
              window.open(report_url)
            },
          },
        },
        stickyTracking: false,
      },
    },
    series: [
      option.series,
      {
        name: 'market_performance',
        data: map_data,
        type: option.type,
        joinBy: ['postal-code', 'place_id'],
        colorKey: 'market_performance_pctl',
        dataLabels: option.data_labels,
        states: {
          hover: {
            enabled: true,
          },
        },
        marker: {
          enabled: true,
        },
      },
    ],
    colorAxis: {
      min: 0,
      max: 100,
      type: 'linear',
      minColor: colorBad,
      maxColor: colorGood,
      stops: [
        [0, colorBad],
        [0.5, colorNeutral],
        [1, colorGood],
      ],
      labels: {
        enabled: false,
      },
    },
    tooltip: {
      formatter: function () {
        return getPlaceTooltip(this.point)
      },
      followPointer: true,
      useHTML: false,
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      title: {
        text: '<span id="map-legend-title">Market rank</span>',
      },
    },
    exporting: {
      enabled: false,
    },
    chart: {
      animation: false,
    },
  })

  return state_chart
}

//Factor out common code with CreateMetroExplorerMap
function createExplorerBarChart(
  chart_container_name,
  barchart_data,
  report_prefix,
) {
  barchart_data = transform_bar_chart_data(barchart_data)
  // var place_names = barchart_data.map(function (item) { return item.place_name; });
  // var place_values = barchart_data.map(function (item) { return item[metric_name]; });

  var metric_label = 'Market x   Rank'
  let chart = Highcharts.chart(chart_container_name, {
    series: [
      {
        type: 'bar',
        data: barchart_data,
        name: metric_label,
      },
    ],
    xAxis: {
      scrollbar: {
        enabled: true,
        liveRedraw: true,
      },
      min: 0,
      max: 22,
      type: 'category',
    },
    yAxis: {
      opposite: true,
      min: 0,
      max: 100,
      title: { text: '' },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: false,
        dataLabels: {
          enabled: false,
        },
      },
      series: {
        events: {
          click: function (event) {
            report_url = report_prefix + event.point.place_id
            window.open(report_url)
          },
        },
        animation: false,
        cursor: 'pointer',
        stickyTracking: false,
        dataSorting: {
          enabled: false,
          sortKey: 'y',
        },
      },
    },
    colorAxis: {
      min: 0,
      max: 100,
      type: 'linear',
      minColor: colorBad,
      maxColor: colorGood,
      stops: [
        [0, colorBad],
        [0.5, colorNeutral],
        [1, colorGood],
      ],
      labels: {
        enabled: false,
      },
    },
    tooltip: {
      formatter: function () {
        return getPlaceTooltip(this.point)
      },
      followPointer: true,
      useHTML: false,
    },

    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    chart: {
      animation: false,
    },
  })
  return chart
}

// create map summary chart;

function createMapSummaryChart(
  Highcharts,
  state_report_prefix,
  top_states,
  colorGood,
  bottom_states,
  colorBad,
) {
  let map_summary_states = Highcharts.mapChart('state_summary_map', {
    plotOptions: {
      map: {
        allAreas: false,
        mapData: Highcharts.maps['countries/us/us-all'],
      },
      series: {
        point: {
          events: {
            click: function (event) {
              report_url = state_report_prefix + event.point.place_id
              window.open(report_url)
            },
          },
        },
        stickyTracking: false,
      },
    },
    series: [
      {
        name: 'background',
        allAreas: true, // show all areas for this series (as a "background")
        showInLegend: false,
        nullColor: '#FFFFFF',
      },
      {
        name: 'top_states',
        data: top_states,
        joinBy: ['postal-code', 'place_id'],
        color: colorGood,
        states: {
          hover: {
            enabled: true,
          },
        },
      },
      {
        name: 'bottom_states',
        data: bottom_states,
        joinBy: ['postal-code', 'place_id'],
        color: colorBad,
        states: {
          hover: {
            enabled: true,
          },
        },
      },
    ],
    tooltip: {
      formatter: function () {
        return (
          '<b>' +
          this.point.place_id +
          '</b><br>Forecasted appreciation: ' +
          this.point.forecasted_appreciation +
          '%'
        )
      },
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    chart: {
      animation: false,
    },
  })

  return map_summary_states
}

function createUSSummarySplineChart(
  history_length,
  forecast_horizon,
  time_axis,
  currentPointIndex,
  hmvi_data_time,
  chart_text_font_size,
  threeMonthForecastPointIndex,
  twelveMonthForecastPointIndex,
  trend_y_axis_min,
  change_trend_y_axis_max,
  colorGrey,
  hmvi_data,
  trend_value_good_cutoff,
  colorGood,
  colorBad,
  chart_marker_radius,
  trend_actual,
  trend_forecast_3m,
  trend_forecast_12m,
  change_trend_actual,
  hmvi_chg_data,
  trend_change_value_good_cutoff,
  change_trend_forecast_12m,
  change_trend_forecast_3m,
) {
  let spline_chart = Highcharts.chart(
    'us_summary_chart',
    {
      chart: {
        type: 'spline',
      },
      title: {
        text: 'HOUSING MARKET VITALITY INDICATOR',
      },
      subtitle: {
        text:
          history_length +
          '-month trend and ' +
          forecast_horizon +
          '-month forecast',
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        categories: time_axis,
        lineWidth: 0,
        labels: {
          enabled: false,
        },
        endOnTick: true,
        startOnTick: true,
        plotLines: [
          {
            value: currentPointIndex,
            zIndex: 0,
            width: 1,
            color: 'grey',
            dashStyle: 'Dot',
            label: {
              text: hmvi_data_time[currentPointIndex],
              align: 'center',
              rotation: 90,
              style: {
                color: 'grey',
                fontSize: chart_text_font_size,
                fontWeight: 'bold',
              },
            },
          },
          {
            value: threeMonthForecastPointIndex,
            zIndex: 0,
            width: 1,
            color: 'grey',
            dashStyle: 'Dot',
            label: {
              text: hmvi_data_time[threeMonthForecastPointIndex],
              align: 'center',
              rotation: 90,
              style: {
                color: 'grey',
                fontSize: chart_text_font_size,
                fontWeight: 'bold',
              },
            },
          },
          {
            value: twelveMonthForecastPointIndex,
            zIndex: 0,
            width: 1,
            color: 'grey',
            dashStyle: 'Dot',
            label: {
              text: hmvi_data_time[twelveMonthForecastPointIndex],
              align: 'center',
              rotation: 90,
              style: {
                color: 'grey',
                fontSize: chart_text_font_size,
                fontWeight: 'bold',
              },
            },
          },
        ],
        crosshair: {
          width: 1,
          color: 'gray',
          dashStyle: 'shortdot',
        },
      },
      yAxis: [
        {
          // Primary yAxis -- monthly levels
          title: null,
          labels: {
            enabled: false,
          },
          gridLineWidth: 0,
          startOnTick: false,
          endOnTick: false,
          maxPadding: 0.05,
          min: trend_y_axis_min,
        },
        {
          // Secondary yAxis-- change
          title: null,
          labels: {
            enabled: false,
          },
          gridLineWidth: 0,
          startOnTick: false,
          endOnTick: false,
          maxPadding: 0.05,
          max: change_trend_y_axis_max,
        },
      ],
      legend: {
        enabled: false,
      },
      plotOptions: {
        spline: {
          dataLabels: {
            enabled: false,
          },
        },
        series: {
          marker: {
            enabled: false,
          },
          lineWidth: 3,
          lineColor: colorGrey,
          states: {
            hover: {
              enabled: false,
            },
          },
          stickyTracking: false,
        },
      },
      series: [
        {
          name: '',
          yAxis: 0,
          data: [
            {
              y: parseFloat(hmvi_data[0]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_data[0]) >= trend_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...trend_actual,
            {
              y: parseFloat(hmvi_data[currentPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_data[currentPointIndex]) >=
                  trend_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...trend_forecast_3m,
            {
              y: parseFloat(hmvi_data[threeMonthForecastPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_data[threeMonthForecastPointIndex]) >=
                  trend_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...trend_forecast_12m,
            {
              y: parseFloat(hmvi_data[twelveMonthForecastPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_data[twelveMonthForecastPointIndex]) >=
                  trend_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            false,
          ],
          color: colorGrey,
          zoneAxis: 'x',
          zones: [
            {
              value: currentPointIndex,
            },
            {
              dashStyle: 'shortdot',
            },
          ],
        },
        {
          name: '',
          yAxis: 1,
          data: [
            {
              y: parseFloat(hmvi_chg_data[0]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_chg_data[0]) >= trend_change_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...change_trend_actual,
            {
              y: parseFloat(hmvi_chg_data[currentPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_chg_data[currentPointIndex]) >=
                  trend_change_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...change_trend_forecast_3m,
            {
              y: parseFloat(hmvi_chg_data[threeMonthForecastPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_chg_data[threeMonthForecastPointIndex]) >=
                  trend_change_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            ...change_trend_forecast_12m,
            {
              y: parseFloat(hmvi_chg_data[twelveMonthForecastPointIndex]),
              dataLabels: {
                enabled: true,
                align: 'center',
                shape: null,
              },
              marker: {
                enabled: true,
                symbol: 'circle',
                fillColor:
                  parseFloat(hmvi_chg_data[twelveMonthForecastPointIndex]) >=
                  trend_change_value_good_cutoff
                    ? colorGood
                    : colorBad,
                radius: chart_marker_radius,
              },
            },
            false,
          ],
          color: colorGrey,
          zoneAxis: 'x',
          zones: [
            {
              value: currentPointIndex,
            },
            {
              dashStyle: 'shortdot',
            },
          ],
        },
      ],
      exporting: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        followPointer: true,
        followTouchMove: true,
        formatter: function () {
          let use_change_chart = false
          return ['<b>' + this.x + '</b><br/>'].concat(
            this.points
              ? this.points.map(function (point) {
                  let startTag,
                    endTag = '</span></b><br/>'
                  if (!use_change_chart) {
                    if (point.y >= trend_value_good_cutoff) {
                      startTag = '<b><span style="color: ' + colorGood + ';">'
                    } else {
                      startTag = '<b><span style="color: ' + colorBad + ';">'
                    }
                    use_change_chart = true
                    return 'HMVI: ' + startTag + point.y + endTag
                  } else {
                    if (point.y >= trend_change_value_good_cutoff) {
                      startTag = '<b><span style="color: ' + colorGood + ';">'
                    } else {
                      startTag = '<b><span style="color: ' + colorBad + ';">'
                    }
                    return '12-month change: ' + startTag + point.y + endTag
                  }
                })
              : [],
          )
        },
        borderColor: '#ffffff',
      },
    },
    function (chart) {
      const series = chart.series
      let use_change_chart = false
      series.forEach((series) => {
        const x = series.points[0].plotX + chart.plotLeft + chart_marker_radius
        const y = series.points[0].plotY + chart.plotTop + 20
        if (!use_change_chart) renderLabel(chart, 'Monthly level', x, y)
        if (use_change_chart) renderLabel(chart, '12-month change', x, y)
        use_change_chart = true
      })
    },
  )
  return spline_chart

  function renderLabel(chart, name, x, y) {
    chart.renderer
      .text(name, x, y)
      .css({
        color: colorGrey,
        fontSize: chart_text_font_size,
      })
      .add()
      .toFront()
  }
}
