/**
 * Define Event Synchronizer
 */

/***/
var EventEmitter = require('events');
var util = require('util');

/**
 * Event Synchronizer, synchronize asynchronous events to perform consequent processing
 * after all conditions apply. Once all required events synced, {@link EventSynchronizer#event:synced} event
 * will be fired.
 * @author nobelhuang
 * @license MIT
 *
 * @constructor
 * @extends EventEmitter
 */
function EventSynchronizer() {

	this.waitMap = {};

	EventEmitter.call(this);
}
util.inherits(EventSynchronizer, EventEmitter);

/**
 * Descriptor for specifying event the synchronizer can wait for.
 * @typedef {Object}	EventSynchronizer~WaitEventDescriptor
 * @property {string}	event	- the event name to wait for
 * @property {number}	times	- if > 0, it indicates how many times the event should be triggered before it can be synced
 * @property {EventSynchronizer~EventRecurCallback}	recurCb	- if given, it will be called once the event is triggered and its return value determines if it is synced.
 */
/**
 * Recurring callback to determine if the recurring event is synced
 * @callback EventSynchronizer~EventRecurCallback
 * @this EventSynchronizer
 */
/**
 * Instruct the synchronizer to wait for a list of specific events to be triggered,
 * and as all events triggered, the synchronizer will fire {@link EventSynchronizer#event:synced} event.
 * @param {...EventSynchronizer~WaitEventDescriptor}	events	- one or more descriptors of events to be waited
 *
 * @fires EventSynchronizer#synced
 */
EventSynchronizer.prototype.waitFor = function() {
	if (arguments.length === 0) {
		throw new Error('Must waitFor some events');
		return;
	}

	var that = this;
	var argArr = Array.from(arguments);

	argArr.forEach(function(event) {
		if (typeof(event) === 'string') {
			event = { event: event };
		}

		event = Object.assign({
			event: '',
			times: 0,
			recurCb: null,

			_count: 0,
			_taken: false
		}, event);

		that.waitMap[event.event] = event;

		that.on(event.event, that.countEvent);
	});
};

/**
 * trigger the event to the synchronizer so that it can count it towards synced state
 * if possible.
 *
 * @param {string}	eventName	- the event name to trigger, should be one of them provided in {@link EventSynchronizer#waitFor} call.
 */
EventSynchronizer.prototype.trigger = function(eventName) {
	this.emit(eventName, eventName);
};

/**
 * @private
 * @param {string}	eventName	- name of event to count
 *
 * @fires EventSynchronizer#synced
 */
EventSynchronizer.prototype.countEvent = function (eventName) {
	var event = this.waitMap[eventName];

	if (!event) {return;}

	if (event.times > 0) {
		event._count++;
		event._taken = (event._count >= event.times);
	}
	else if (event.recurCb) {
		event._taken = event.recurCb.call(this);
	}
	else {
		event._taken = true;
	}

	/** we don't want to count this event again if it is taken already */
	if (event._taken) {
		this.removeAllListeners(eventName);
	}

	/** check if all events taken and so fire the synced event for outside */
	var allTaken = true;
	for (eventName in this.waitMap) {
		if (this.waitMap[eventName]._taken !== true) {
			allTaken = false;
			break;
		}
	}

	if (allTaken) {
		var that = this;
		setImmediate(function() {
			/** we would like to emit this synced event asynchronously */
			/**
			 * Event indicating all waiting events have been synchronized
			 * @event EventSynchronizer#synced
			 */
			that.emit('synced');
		});
	}
}

module.exports = EventSynchronizer;
