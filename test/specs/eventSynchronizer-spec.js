/**
 * For testing EventSynchronizer module
 * @author nobelhuang
 */

var EventSynchronizer = global.general.loadModule('eventSynchronizer');

describe('EventSynchronizer test suite', function() {

	beforeEach(function() {
		this.syncer = new EventSynchronizer();
	});

	it('can sync several plain events', function(done) {
		var that = this;
		var syncTime = null;
		var eventArr = [{
			event: 'event1',
			triggered: false
		}, {
			event: {event: 'event2'},
			triggered: false
		}, {
			event: 'event3',
			triggered: false
		}];

		this.syncer.waitFor(eventArr[0].event, eventArr[1].event, eventArr[2].event);
		this.syncer.on('synced', function() {
			syncTime = (new Date()).getTime();
			expect(eventArr[0].triggered).toBe(true);
			expect(eventArr[1].triggered).toBe(true);
			expect(eventArr[2].triggered).toBe(true);
			done();
		});
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[0].event)
			eventArr[0].triggered = true;
		}, 100);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggered = true;
		}, 200);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[2].event)
			eventArr[2].triggered = true;
		}, 300);
	});

	it('can sync counted events', function(done) {
		var that = this;
		var syncTime = null;
		var eventArr = [{
			event: 'event1',
			triggered: false
		}, {
			event: {
				event: 'countevent1',
				times: 3
			},
			triggerTimes: 0
		}];

		this.syncer.waitFor(eventArr[0].event, eventArr[1].event);
		this.syncer.on('synced', function() {
			syncTime = (new Date()).getTime();
			expect(eventArr[0].triggered).toBe(true);
			expect(eventArr[1].triggerTimes).toBe(eventArr[1].event.times);
			done();
		});
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[0].event)
			eventArr[0].triggered = true;
		}, 100);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 100);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 200);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 300);
	});

	it('can sync recurring events', function(done) {
		var that = this;
		var syncTime = null;
		var recurTimes = 0;
		var eventArr = [{
			event: 'event1',
			triggered: false
		}, {
			event: {
				event: 'recurevent1',
				recurCb: function() {
					return (recurTimes >= 3);
				}
			},
			triggerTimes: 0
		}];

		this.syncer.waitFor(eventArr[0].event, eventArr[1].event);
		this.syncer.on('synced', function() {
			syncTime = (new Date()).getTime();
			expect(eventArr[0].triggered).toBe(true);
			expect(recurTimes).toBe(3);
			done();
		});
		setTimeout(function() {
			expect(syncTime).toBeNull();
			that.syncer.trigger(eventArr[0].event)
			eventArr[0].triggered = true;
		}, 100);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			recurTimes++;
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 100);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			recurTimes++;
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 200);
		setTimeout(function() {
			expect(syncTime).toBeNull();
			recurTimes++;
			that.syncer.trigger(eventArr[1].event.event)
			eventArr[1].triggerTimes++;
		}, 300);
	});
});
