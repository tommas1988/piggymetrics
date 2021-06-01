var debug = false;

function register(params) {
  debug = !!(params.debug);
}

function process(event) {
  var parseInfo = new ParseInfo(event.Get('message'));
  var gcEvent = new GCEvent();

  parseDateStamp(parseInfo, gcEvent);
  parseTimeStamp(parseInfo, gcEvent);

  if (!gcEvent.timestamp) {
      if (debug)
        throw 'Can not parse gc timestamp at pos: ' + parseInfo.pos;

    // no gc timestamp find skip this event
    return;
  }


}

function ParseInfo(message) {
  this.message = message;
  this.pos = 0;
}

ParseInfo.prototype.equalsAt(pos, str) {
  return this.message.substring(pos, pos + str.length) == str;
}

function GCEvent() {
  this.datestamp = null;
  this.timestamp = null;
  this.gcType = null;
}

// find and convert 2021-05-31T22:05:40.007+0800 to 2021-05-31T22:05:40.007Z for @timestamp
var LENGTH_OF_DATESTAMP = 28;

function parseDateStamp(pi, gcEvent) {
  if (pi.message[4] == '-' && pi.message[7] == '-') {
    // TODO: validate the date with a regular expression
    var date = new Date(pi.message.substring(0, LENGTH_OF_DATESTAMP));
    if (date && pi.equalsAt(LENGTH_OF_DATESTAMP, ': ')) {
      gcEvent.datestamp = pi.message.substring(0, LENGTH_OF_DATESTAMP - 5) + 'Z';

      // pass the following ": "
      pi.pos = LENGTH_OF_DATESTAMP + 2
    }
  }
}

var timeStampRegExp = /^\d*\.\d/;
// enough to hold to timestamp string
var LENGTH_OF_TIMESTAMP = 20;

function parseTimeStamp(pi) {
  var tsStr = pi.message.substring(pi.pos, pi.pos + LENGTH_OF_TIMESTAMP);
  var r = timeStampRegExp.exec(tsStr);
  var ts;
  if (r && (ts = r[0]) && pi.equalsAt(pi.pos + ts.length, ': ')) {
    gcEvent.timestamp = ts;

    // pass the following ": "
    pi.pos += (ts.length + 2)
  }


}

function parseGCEvent(pi, gcEvent) {

}
