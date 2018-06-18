module.exports = function (events, eventFilter) {
    var filteredEvents = Object.create(events);

    filteredEvents.on = function (eventType, handler, priority) {
        var filteredHandler = function (event) {
            if (eventFilter(event)) {
                return handler(event);
            }
        };
        events.on.call(this, eventType, filteredHandler, priority);
    };

    return filteredEvents;
}
