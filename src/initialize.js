var initialize = async () => {
  let data_url = './data/monthly_report_data.json'
  let state_report_prefix = 'https://housingiq.com/state-reports/'
  let metro_report_prefix = 'https://housingiq.com/market-reports/place_id-'

  let monthly_data = await fetch(data_url).then((response) => response.json())
  const topology = await fetch(
    'https://code.highcharts.com/mapdata/countries/us/us-all.topo.json',
  ).then((response) => response.json())

  //get each datas from monthly_data
  let hmvi_time = monthly_data['hmvi_time.ts'].map((x) => Date.parse(x))
  let hmvi_time_fmt = monthly_data['hmvi_time.fmt']
  let hmvi_us = monthly_data['hmvi_us.ts'].map((x) => parseFloat(x))
  let hmvi_us_chg = monthly_data['hmvi_us_chg.12.ts'].map((x) => parseFloat(x))

  let hmvi_num_states_trend_up = monthly_data[
    'hmvi_us_num_states_trend_up.ts'
  ].map((x) => parseFloat(x))

  let hmvi_num_states_outperforming = monthly_data[
    'hmvi_us_num_states_outperforming.ts'
  ].map((x) => parseFloat(x))

  let hmvi_pct_metro_trend_up = monthly_data[
    'hmvi_us_pct_metro_trend_up.ts'
  ].map((x) => parseFloat(x))

  let hmvi_pct_metro_outperforming = monthly_data[
    'hmvi_us_pct_metro_outperforming.ts'
  ].map((x) => parseFloat(x))

  let top_states = JSON.parse(monthly_data.top_states[0])
  let bottom_states = JSON.parse(monthly_data.bottom_states[0])

  let state_performance_data_rows = JSON.parse(
    monthly_data.state_performance.data_rows,
  )

  let state_map_data = JSON.parse(monthly_data.map_data_state[0])

  state_map_data = state_map_data.map((item) => {
    return {
      ...item,
      search_place: item['place_name'].toLowerCase(),
    }
  })

  let top_metros = JSON.parse(monthly_data.top_metros[0])
  let bottom_metros = JSON.parse(monthly_data.bottom_metros[0])

  let metro_performance_data_rows = JSON.parse(
    monthly_data.metro_performance.data_rows,
  )

  let metro_map_data = JSON.parse(monthly_data.map_data_metro[0])
  metro_map_data = metro_map_data.map((item) => {
    return {
      ...item,
      search_place: item['place_name'].toLowerCase(),
    }
  })

  //initialize base display: overview, table....
  setValueById('#report_date', monthly_data.report_date)
  setValueById('#us_overview', monthly_data.us_overview)
  setValueById('#us_overview_2', monthly_data.us_overview_2)
  setValueById('#state_overview', monthly_data.state_overview)
  setValueById(
    '#state_performance_overview',
    monthly_data.state_performance.overview,
  )
  setValueById('#metro_overview', monthly_data.metro_overview)
  setValueById(
    '#metro_performance_overview',
    monthly_data.metro_performance.overview,
  )

  let id_number = 0
  for (let i = 1; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      id_number = i + '' + j

      let state_performance_value = state_performance_data_rows[i - 1][j - 1]
      setValueById('#performance_states_' + id_number, state_performance_value)

      let metro_performance_value = state_performance_data_rows[i - 1][j - 1]
      setValueById('#performance_metros_' + id_number, metro_performance_value)
    }
  }

  initRankingTable(top_states, bottom_states, 4, 'states')
  initRankingTable(top_metros, bottom_metros, 6, 'metros')

  // initialize chart:
  // Highcharts
  // trend
  let chart_marker_radius = 6
  let chart_text_font_size = 12
  let history_length = 36
  let trend_value_good_cutoff = 100
  let trend_change_value_good_cutoff = 0

  //We only display "history_length" number of months
  startPointIndex = hmvi_us.length - (history_length + forecast_horizon) - 1
  hmvi_data = hmvi_us.slice(startPointIndex)
  hmvi_data = hmvi_data.map((x) => parseFloat(x))
  hmvi_chg_data = monthly_data['hmvi_us_chg.12.ts'].slice(startPointIndex)
  hmvi_chg_data = hmvi_chg_data.map((x) => parseFloat(x))
  hmvi_data_time = hmvi_time_fmt.slice(startPointIndex)

  //We pass the data to the line chart in "segments" so it can be styled, labeled, etc.
  let twelveMonthForecastPointIndex = hmvi_data_time.length - 1 //48
  let currentPointIndex = twelveMonthForecastPointIndex - forecast_horizon //36
  let threeMonthForecastPointIndex =
    twelveMonthForecastPointIndex - (forecast_horizon - 3) //39

  let trend_actual = [],
    trend_forecast_3m = [],
    trend_forecast_12m = []

  for (let i = 1; i < currentPointIndex; i++) trend_actual[i - 1] = hmvi_data[i]
  for (let i = currentPointIndex + 1; i < threeMonthForecastPointIndex; i++)
    trend_forecast_3m[i - currentPointIndex - 1] = hmvi_data[i]
  for (
    let i = threeMonthForecastPointIndex + 1;
    i < twelveMonthForecastPointIndex;
    i++
  )
    trend_forecast_12m[i - threeMonthForecastPointIndex - 1] = hmvi_data[i]

  let change_trend_actual = [],
    change_trend_forecast_3m = [],
    change_trend_forecast_12m = []
  for (let i = 1; i < currentPointIndex; i++)
    change_trend_actual[i - 1] = hmvi_chg_data[i]
  for (let i = currentPointIndex + 1; i < threeMonthForecastPointIndex; i++)
    change_trend_forecast_3m[i - currentPointIndex - 1] = hmvi_chg_data[i]
  for (
    let i = threeMonthForecastPointIndex + 1;
    i < twelveMonthForecastPointIndex;
    i++
  )
    change_trend_forecast_12m[i - threeMonthForecastPointIndex - 1] =
      hmvi_chg_data[i]

  //We want to stack the two line charts (independent y-axis) and have a common time axis (x-axis)
  //So we play with the y-axis for both charts to create space below the top chart and above the bottom chart
  let trend_y_axis_max,
    trend_y_axis_min,
    change_trend_y_axis_max,
    change_trend_y_axis_min
  trend_y_axis_max = Math.max(...hmvi_data)
  trend_y_axis_min = Math.min(...hmvi_data)

  change_trend_y_axis_max = Math.max(...hmvi_chg_data)
  change_trend_y_axis_min = Math.min(...hmvi_chg_data)

  trend_y_axis_min =
    trend_y_axis_max - (trend_y_axis_max - trend_y_axis_min) * 2.5
  change_trend_y_axis_max =
    change_trend_y_axis_min +
    (change_trend_y_axis_max - change_trend_y_axis_min) * 2.5

  let time_axis = hmvi_data_time
  let us_summary_spline_chart = createUSSummarySplineChart(
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
  )
  let states_map_summary = createMapSummaryChart(
    Highcharts,
    state_report_prefix,
    top_states,
    colorGood,
    bottom_states,
    colorBad,
  )

  createUSExplorer(
    'us_chart',
    hmvi_time,
    hmvi_us,
    hmvi_us_chg,
    hmvi_num_states_trend_up,
    hmvi_num_states_outperforming,
    hmvi_pct_metro_trend_up,
    hmvi_pct_metro_outperforming,
  )

  let state_map_chart = createExplorerMap(
    'state_map',
    state_map_data,
    state_report_prefix,
    topology,
    {
      series: {},
      data_labels: {
        enabled: true,
        color: '#FFFFFF',
        format: '{point.place_id}',
      },
      type: 'map',
    },
  )

  let state_bar_chart = createExplorerBarChart(
    'state_barchart',
    state_map_data,
    state_report_prefix,
  )

  let state_explorer_root = document.querySelector('#states_explorer')

  let state_map_info = {
    map_data: state_map_data,
    map_chart: state_map_chart,
    bar_chart: state_bar_chart,
  }

  init_all_event_handler(state_explorer_root, state_map_info)
  update_map_and_chart(state_explorer_root, state_map_info)

  let metro_map_chart = createExplorerMap(
    'metro_map',
    metro_map_data,
    metro_report_prefix,
    topology,
    {
      series: {
        name: 'background',
        mapData: topology,
        nullColor: '#FFFFFF',
      },
      data_labels: {},
      type: 'mappoint',
    },
  )
  let metro_bar_chart = createExplorerBarChart(
    'metro_barchart',
    metro_map_data,
    metro_report_prefix,
  )

  let metro_map_info = {
    map_data: metro_map_data,
    map_chart: metro_map_chart,
    bar_chart: metro_bar_chart,
  }

  let metro_explorer_root = document.querySelector('#metro_explorer')

  init_all_event_handler(metro_explorer_root, metro_map_info)
  update_map_and_chart(metro_explorer_root, metro_map_info)
}

function initRankingTable(top, bottom, length, id) {
  let top_id = '#top_' + id + '_'
  let bottom_id = '#bottom_' + id + '_'
  for (let i = 1; i < length; i++) {
    let top_place_id =
      id == 'states' ? top[i - 1].place_id : top[i - 1].place_name
    let bottom_place_id =
      id == 'states' ? bottom[i - 1].place_id : bottom[i - 1].place_name

    setValueById(top_id + i + '1', top_place_id)
    setValueById(top_id + i + '2', top[i - 1].forecasted_appreciation)
    setValueById(bottom_id + i + '1', bottom_place_id)
    setValueById(bottom_id + i + '2', bottom[i - 1].forecasted_appreciation)
  }
}

function setValueById(id, value) {
  document.querySelector(id).innerHTML = value
}

// Initialize range slider
document.querySelectorAll('.range-slider').forEach((parent) => {
  if (!parent) {
    return
  }

  const rangeS = parent.querySelectorAll('input[type="range"]'),
    numberS = parent.querySelectorAll('input[type="number"]')

  rangeS.forEach((el) => {
    el.oninput = () => {
      let lowerVal = parseFloat(rangeS[0].value),
        upperVal = parseFloat(rangeS[1].value)

      if (upperVal < lowerVal + 5) {
        rangeS[0].value = upperVal - 5
      }
      if (lowerVal > upperVal - 5) {
        rangeS[1].value = lowerVal + 5
      }

      numberS[0].value = lowerVal
      numberS[1].value = upperVal
    }
  })
})

initialize()
