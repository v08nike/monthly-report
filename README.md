#initailize.js
In here, I define about getting data section and initialize all charts and set event listener to controll buttons. All event lister function is in event_handers.js.

#event_handler.js
I set all button event listeners. That event listener functions are in events.js.

#event.js
In this file, there are event functions that be called from event_handler.js.
Inside event funcitons, they have to update chart data. So they call function in highchart_controll.js.

#highchart_controll.js
There are section that map_chart and bar_chart are updated.