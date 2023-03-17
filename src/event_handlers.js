//temp variables
var unvisible_places = {}

//start setting all event handler code
function init_all_event_handler(root, map_info) {
  /*
   * Set event telative with state map
   * init search-button event listener
   */
  root.querySelector('[tag-type="Search"]').addEventListener(
    'click',
    function (root, event) {
      //display search modal:
      root.querySelector('[tag-type="search-modal"]').style.display = 'block'
      root.querySelector('[tag-type="hmvi_explorer_input_text"]').focus()
    }.bind(this, root),
  )
  // set all event for search modal:
  init_search_modal_handler(root, map_info)

  // init sort-button event listner
  root.querySelector('[tag-type="Sort"]').addEventListener(
    'click',
    function (root, event) {
      //display sort modal:
      root.querySelector('[tag-type="sort-modal"]').style.display = 'block'
    }.bind(this, root),
  )
  // set all event for sort modal:
  init_sort_modal_handler(root, map_info)

  // init filter-button event listner
  root.querySelector('[tag-type="Filter"]').addEventListener(
    'click',
    function (root, event) {
      //display filter modal:
      root.querySelector('[tag-type="filter-modal"]').style.display = 'block'
    }.bind(this, root),
  )
  // set all event for filter modal:
  init_filter_modal_handler(root, map_info)

  // init summary-button event listner
  root.querySelector('[tag-type="Summary"]').addEventListener(
    'click',
    function (root, event) {
      // set all event for summary modal:
      calc_and_display_summary(root, map_info)
    }.bind(this, root),
  )
  // init refresh-button event listner
  root.querySelector('[tag-type="Refresh"]').addEventListener(
    'click',
    function (event) {
      //init all filters:
      refresh(root, map_info)
    }.bind(this, root),
  )

  // handle the click on the close modal item
  root.querySelectorAll('.close').forEach((item) => {
    item.addEventListener('click', function (event) {
      root.querySelector('[tag-type="search-modal"]').style.display = 'none'
      root.querySelector('[tag-type="sort-modal"]').style.display = 'none'
      root.querySelector('[tag-type="filter-modal"]').style.display = 'none'
      root.querySelector('[tag-type="summary-modal"]').style.display = 'none'
    })
  })

  // handle the click on the close button
  root.querySelectorAll('.close-btn').forEach((item) => {
    item.addEventListener('click', function (event) {
      root.querySelector('[tag-type="search-modal"]').style.display = 'none'
      root.querySelector('[tag-type="sort-modal"]').style.display = 'none'
      root.querySelector('[tag-type="filter-modal"]').style.display = 'none'
      root.querySelector('[tag-type="summary-modal"]').style.display = 'none'
    })
  })
  // handle the click on the outside of the modal
  root.querySelectorAll('.modal').forEach((item) => {
    item.addEventListener('click', function (event) {
      root.querySelector('[tag-type="search-modal"]').style.display = 'none'
      root.querySelector('[tag-type="sort-modal"]').style.display = 'none'
      root.querySelector('[tag-type="filter-modal"]').style.display = 'none'
      root.querySelector('[tag-type="summary-modal"]').style.display = 'none'
    })
  })

  root.querySelectorAll('.modal-content').forEach((item) => {
    item.addEventListener('click', function (event) {
      event.stopPropagation()
    })
  })
}

//set all search modal event handler
function init_search_modal_handler(root, map_info) {
  root.querySelector('[tag-type="hmvi_explorer_input_text"]').focus()
  root
    .querySelector('[tag-type="hmvi_explorer_input_text"]')
    .addEventListener(
      'input',
      search_input_event_listner.bind(this, root, map_info),
    )
  root.querySelector('[tag-type="input_text_reset"]').addEventListener(
    'click',
    function (root, e) {
      e.preventDefault()
      root.querySelector('[tag-type="hmvi_explorer_input_text"]').value = ''
      root.querySelector('[tag-type="suggestions"]').innerHTML = ''
    }.bind(this, root),
  )
}

//remove active class from map sort button
function removeMapFilterActiveClass(root) {
  root
    .querySelector('[tag-type="market_performance"]')
    .classList.remove('active')
  root.querySelector('[tag-type="situation"]').classList.remove('active')
  root.querySelector('[tag-type="outlook"]').classList.remove('active')
}

//set all sort modal event handler
function init_sort_modal_handler(root, map_info) {
  root.querySelector('[tag-type="market_performance"]').addEventListener(
    'click',
    function (root, map_info, e) {
      e.preventDefault()
      removeMapFilterActiveClass(root)
      root.querySelector('[id="map-legend-title"]').innerHTML = 'Market Rank'
      root
        .querySelector('[tag-type="market_performance"]')
        .classList.add('active')
      update_map_and_chart(root, map_info)
    }.bind(this, root, map_info),
  )
  root.querySelector('[tag-type="situation"]').addEventListener(
    'click',
    function (root, map_info, e) {
      e.preventDefault()
      removeMapFilterActiveClass(root)
      root.querySelector('[id="map-legend-title"]').innerHTML = 'Situation'
      root.querySelector('[tag-type="situation"]').classList.add('active')
      update_map_and_chart(root, map_info)
    }.bind(null, root, map_info),
  )
  root.querySelector('[tag-type="outlook"]').addEventListener(
    'click',
    function (root, map_info, e) {
      e.preventDefault()
      removeMapFilterActiveClass(root)
      root.querySelector('[id="map-legend-title"]').innerHTML = 'Outlook'
      root.querySelector('[tag-type="outlook"]').classList.add('active')
      update_map_and_chart(root, map_info)
    }.bind(this, root, map_info),
  )
}

//set all modal event handler
function init_filter_modal_handler(root, map_info) {
  root.querySelector('[tag-type="market-rank-range"]').addEventListener(
    'mouseup',
    function (root, map_info, e) {
      e.preventDefault()
      update_map_and_chart(root, map_info)
    }.bind(this, root, map_info),
  )

  root
    .querySelectorAll(
      '[tag-type="outperforming"], ' +
        '[tag-type="tracking"], ' +
        '[tag-type="underperforming"], ' +
        '[tag-type="outperform"], ' +
        '[tag-type="track"], ' +
        '[tag-type="underperform"]',
    )
    .forEach((item) => {
      item.addEventListener(
        'click',
        function (root, map_info, e) {
          update_map_and_chart(root, map_info)
        }.bind(this, root, map_info),
      )
    })
}

// calculate all data and display
function calculateOutlookSituationLabelPercent(
  data,
  outlook_label,
  situation_label,
) {
  let labels_count = 0
  for (let item of data) {
    if (
      item['outlook'] === outlook_label &&
      item['situation'] === situation_label
    ) {
      labels_count++
    }
  }
  if (data) {
    return labels_count
  }
  return 0
}

function calcPercent(value, inivalue) {
  return ((value * 100) / inivalue).toFixed(0)
}

function stringOfvalueAndpercend(value, initvalue) {
  return value + ' (' + calcPercent(value, initvalue) + '%)'
}

function calc_and_display_summary(root, map_info) {
  let { map_chart, map_data, bar_chart } = map_info

  let current_map_length = map_chart.series[bar_chart ? 1 : 0].data.length
  let init_map_length = map_data.length
  let series_id = bar_chart ? 1 : 0

  range_min = root.querySelector("[tag-type='slider-min']").value
  range_max = root.querySelector("[tag-type='slider-max']").value

  let outperform_outperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Outperform',
    'Outperforming',
  )
  let outperform_track = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Track',
    'Outperforming',
  )
  let outperform_underperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Underperform',
    'Outperforming',
  )
  let outperform_total_count =
    parseFloat(outperform_outperform) +
    parseFloat(outperform_track) +
    parseFloat(outperform_underperform)
  root.querySelector(
    "[tag-type='outperforming-outperform']",
  ).innerHTML = stringOfvalueAndpercend(outperform_outperform, init_map_length)
  root.querySelector(
    "[tag-type='outperforming-track']",
  ).innerHTML = stringOfvalueAndpercend(outperform_track, init_map_length)
  root.querySelector(
    "[tag-type='outperforming-underperform']",
  ).innerHTML = stringOfvalueAndpercend(
    outperform_underperform,
    init_map_length,
  )
  root.querySelector(
    "[tag-type='outperforming-total']",
  ).innerHTML = stringOfvalueAndpercend(outperform_total_count, init_map_length)

  let tracking_outperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Outperform',
    'Tracking',
  )
  let tracking_track = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Track',
    'Tracking',
  )
  let tracking_underperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Underperform',
    'Tracking',
  )
  let tracking_total_count =
    parseFloat(tracking_outperform) +
    parseFloat(tracking_track) +
    parseFloat(tracking_underperform)
  root.querySelector(
    "[tag-type='tracking-outperform']",
  ).innerHTML = stringOfvalueAndpercend(tracking_outperform, init_map_length)
  root.querySelector(
    "[tag-type='tracking-track']",
  ).innerHTML = stringOfvalueAndpercend(tracking_track, init_map_length)
  root.querySelector(
    "[tag-type='tracking-underperform']",
  ).innerHTML = stringOfvalueAndpercend(tracking_underperform, init_map_length)
  root.querySelector(
    "[tag-type='tracking-total']",
  ).innerHTML = stringOfvalueAndpercend(tracking_total_count, init_map_length)

  let underperform_outperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Outperform',
    'Underperforming',
  )
  let underperform_track = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Track',
    'Underperforming',
  )
  let underperform_underperform = calculateOutlookSituationLabelPercent(
    map_chart.series[series_id]['data'],
    'Underperform',
    'Underperforming',
  )
  let underperform_total_count =
    parseFloat(underperform_outperform) +
    parseFloat(underperform_track) +
    parseFloat(underperform_underperform)
  root.querySelector(
    "[tag-type='underperforming-outperform']",
  ).innerHTML = stringOfvalueAndpercend(
    underperform_outperform,
    init_map_length,
  )
  root.querySelector(
    "[tag-type='underperforming-track']",
  ).innerHTML = stringOfvalueAndpercend(underperform_track, init_map_length)
  root.querySelector(
    "[tag-type='underperforming-underperform']",
  ).innerHTML = stringOfvalueAndpercend(
    underperform_underperform,
    init_map_length,
  )
  root.querySelector(
    "[tag-type='underperforming-total']",
  ).innerHTML = stringOfvalueAndpercend(
    underperform_total_count,
    init_map_length,
  )

  let total_outperform_count =
    parseFloat(outperform_outperform) +
    parseFloat(tracking_outperform) +
    parseFloat(underperform_outperform)
  let total_track_count =
    parseFloat(outperform_track) +
    parseFloat(tracking_track) +
    parseFloat(underperform_track)
  let total_underperform_count =
    parseFloat(outperform_underperform) +
    parseFloat(tracking_underperform) +
    parseFloat(underperform_underperform)
  let total_total_count =
    outperform_total_count + tracking_total_count + underperform_total_count
  root.querySelector(
    "[tag-type='total-outperform']",
  ).innerHTML = stringOfvalueAndpercend(total_outperform_count, init_map_length)
  root.querySelector(
    "[tag-type='total-track']",
  ).innerHTML = stringOfvalueAndpercend(total_track_count, init_map_length)
  root.querySelector(
    "[tag-type='total-underperform']",
  ).innerHTML = stringOfvalueAndpercend(
    total_underperform_count,
    init_map_length,
  )
  root.querySelector(
    "[tag-type='total-total']",
  ).innerHTML = stringOfvalueAndpercend(total_total_count, init_map_length)

  root.querySelector("[tag-type='summary-content']").innerHTML =
    'Displaying ' +
    total_total_count +
    ' of ' +
    init_map_length +
    ' (' +
    calcPercent(total_total_count, init_map_length) +
    '%) markets'

  //display metro summary modal:
  root.querySelector('[tag-type="summary-modal"]').style.display = 'block'
}

function refresh(root, map_info) {
  selected_places = []
  root.querySelector('[tag-type="slider-min"]').value = 0
  root.querySelector('[tag-type="slider-max"').value = 100
  root.querySelector('.slider-x').value = 100
  root.querySelector('.slider-n').value = 0
  root.querySelector("[tag-type='underperform']").value = 'on'
  root.querySelector("[tag-type='track']").value = 'on'
  root.querySelector("[tag-type='outperform']").value = 'on'
  root.querySelector("[tag-type='outperforming']").value = 'on'
  root.querySelector("[tag-type='underperforming']").value = 'on'
  root.querySelector("[tag-type='tracking']").value = 'on'
  // update the checked value
  root.querySelector("[tag-type='underperform']").checked = true
  root.querySelector("[tag-type='track']").checked = true
  root.querySelector("[tag-type='outperform']").checked = true
  root.querySelector("[tag-type='outperforming']").checked = true
  root.querySelector("[tag-type='underperforming']").checked = true
  root.querySelector("[tag-type='tracking']").checked = true
  // sort by market rank
  root.querySelector('[tag-type="hmvi_explorer_input_text"').value = ''
  root.querySelector('[tag-type="hmvi_explorer_itme_selected"').innerHTML = ''

  removeMapFilterActiveClass(root)
  root.querySelector('[tag-type="market_performance"]').classList.add('active')
  root.querySelector('[id="map-legend-title"]').innerHTML = 'Market Rank'

  update_map_and_chart(root, map_info)
}
//end setting all event handler code

//start events code
var selected_places = []

function search_input_event_listner(root, map_info, e) {
  e.preventDefault()
  let search_value = e.target.value
  let map_data = map_info.map_data

  root.querySelector('[tag-type="suggestions"]').innerHTML =
    '<div id="listbox"></div>'
  if (search_value) {
    let matched_items = get_matched_items(root, search_value, map_data)
    matched_items.forEach((element) => {
      const elementItem = document.createElement('div')
      elementItem.setAttribute('data-id', element.place_id)
      elementItem.setAttribute('class', element.class_name)
      elementItem.innerHTML = element.place_name
      root.querySelector('#listbox').appendChild(elementItem)
      if (element.class_name == 'autocomplete-item') {
        elementItem.addEventListener(
          'click',
          search_result_select_event_listener.bind(this, root, map_info),
        )
      }
    })
  }
}

function get_matched_items(root, search_value, data) {
  let matched_items = []
  let map_data_type = root.getAttribute('data-id')
  search_value = search_value.toLowerCase()

  data.forEach((element) => {
    if (element['search_place'].includes(search_value)) {
      let class_name = 'autocomplete-item'
      if (unvisible_places[map_data_type].includes(element['place_id'])) {
        class_name = 'autocomplete-item-disable'
      }
      matched_items.push({ ...element, class_name })
    }
  })
  return matched_items
}

function search_result_select_event_listener(root, map_info, e) {
  e.preventDefault()
  root.querySelector("[tag-type='hmvi_explorer_input_text'").value = ''
  root.querySelector('#listbox').innerHTML = ''
  let selected_data_id = e.target.getAttribute('data-id')
  if (selected_places.includes(selected_data_id)) {
    return
  }

  selected_places.push(selected_data_id)
  const selectedElement = document.createElement('span')
  selectedElement.setAttribute('data-id', selected_data_id)
  selectedElement.setAttribute('class', 'selected-item')
  selectedElement.innerHTML = '&times; ' + e.srcElement.innerHTML
  selectedElement.addEventListener('click', function (event) {
    event.target.remove()
    // delete item from the selected list
    for (let i = 0; i < selected_places.length; i++) {
      if (selected_places[i] === selected_data_id) {
        selected_places.splice(i, 1)
        update_map_and_chart(root, map_info)
        break
      }
    }
  })

  root
    .querySelector("[tag-type='hmvi_explorer_itme_selected']")
    .appendChild(selectedElement)

  update_map_and_chart(root, map_info)
}
// end events code

//start high chart control code
const max_visible_value = 20
// filter by filter datas
function filter_function(value, condition, place_id, data_type) {
  if (value !== condition) {
    return true
  } else {
    unvisible_places[data_type].push(place_id)
    return false
  }
}

function update_data_by_filter(root, map_data, sort_type) {
  let updated_data = map_data
  map_data_type = root.getAttribute('data-id')
  unvisible_places[map_data_type] = []

  if (!root.querySelector("[tag-type='outperforming']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(
        item.situation,
        'Outperforming',
        item.place_id,
        map_data_type,
      ),
    )
  }

  if (!root.querySelector("[tag-type='underperforming']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(
        item.situation,
        'Underperforming',
        item.place_id,
        map_data_type,
      ),
    )
  }

  if (!root.querySelector("[tag-type='tracking']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(item.situation, 'Tracking', item.place_id, map_data_type),
    )
  }

  // outlook filter
  if (!root.querySelector("[tag-type='outperform']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(item.outlook, 'Outperform', item.place_id, map_data_type),
    )
  }

  if (!root.querySelector("[tag-type='underperform']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(
        item.outlook,
        'Underperform',
        item.place_id,
        map_data_type,
      ),
    )
  }

  if (!root.querySelector("[tag-type='track']").checked) {
    updated_data = updated_data.filter((item) =>
      filter_function(item.outlook, 'Track', item.place_id, map_data_type),
    )
  }

  range_min = root.querySelector("[tag-type='slider-min']").value
  range_max = root.querySelector("[tag-type='slider-max']").value
  updated_data = updated_data.filter((item) => {
    if (
      item['market_performance_pctl'] <= range_max &&
      item['market_performance_pctl'] >= range_min
    ) {
      return true
    } else {
      unvisible_places[map_data_type].push(item.place_id)
      return false
    }
  })

  return updated_data
}

function set_highlight_by_search_result(map_data) {
  updated_data = map_data.map((item) => {
    let place_id = item.place_id.toString()
    if (selected_places.includes(place_id)) {
      return {
        ...item,
        is_selected: true,
        marker: {
          lineColor: colorHighlight,
          lineWidth: 3,
        },
        borderWidth: 3,
        borderColor: colorHighlight,
      }
    }

    return item
  })

  return updated_data
}

function update_and_display_map_data(
  map_chart,
  bar_chart,
  updated_data,
  sort_type,
  map_data,
) {
  map_chart.series[1].update({
    colorKey: sort_type,
    data: transform_map_data(updated_data, sort_type),
  })

  var bar_chart_data = transform_bar_chart_data(updated_data, sort_type)

  let target_index = -1

  //get index of item selected by user
  for (let i = selected_places.length - 1; i >= 0; i--) {
    for (let j = 0; j < bar_chart_data.length; j++) {
      if (bar_chart_data[j]['place_id'].toString() === selected_places[i]) {
        target_index = j
        break
      }
    }
    if (target_index !== -1) break
  }

  let from = target_index - max_visible_value / 2
  let to = target_index + max_visible_value / 2
  if (from < 0) {
    from = 0
    if (bar_chart_data.length < max_visible_value) {
      to = bar_chart_data.length - 1
    } else {
      to = max_visible_value
    }
  }

  if (to >= bar_chart_data.length - 1) {
    from = bar_chart_data.length - 1 - max_visible_value
    to = bar_chart_data.length - 1
  }

  if (from < 0) {
    from = 0
  }

  // update bar chart and display it.
  bar_chart.update({
    name: sort_type,
    series: {
      data: [],
    },
  })

  bar_chart.update({
    name: sort_type,
    series: {
      data: bar_chart_data,
    },
    xAxis: {
      min: from,
      max: to,
    },
  })

  bar_chart.xAxis[0].setExtremes(from, to)
  bar_chart.redraw()
}

//update map chart and bar chart depend on filter datas
function update_map_and_chart(root, map_info) {
  root.querySelector('[tag-type="hmvi_explorer_input_text"').value = ''
  root.querySelector('[tag-type="suggestions"').innerHTML = ''

  let { map_data, map_chart, bar_chart } = map_info

  let sort_type =
    root.querySelector('.active').getAttribute('tag-type') + '_pctl'

  let updated_data = new Array(map_data)
  updated_data = map_data_sort_by(map_data, sort_type)
  //filtering by filter data
  updated_data = update_data_by_filter(root, updated_data, sort_type)
  //set hightlight on data selected by user
  updated_data = set_highlight_by_search_result(updated_data)

  //when this is metro map and chart
  update_and_display_map_data(
    map_chart,
    bar_chart,
    updated_data,
    sort_type,
    map_data,
  )
}
//end high chart control code
