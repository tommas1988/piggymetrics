var debug = false;

// ecs field names
var ECS_TIMESTAMP = 'GC4j.Timestamp';
var ECS_MEMORY_YOUNG_BEFORE_GC = 'GC4j.Memory.Young.BeforeGC';
var ECS_MEMORY_YOUNG_AFTER_GC = 'GC4j.Memory.Young.AfterGC';
var ECS_MEMORY_YOUNG_TOTAL = 'GC4j.Memory.Young.Total';
var ECS_MEMORY_TENURED_BEFORE_GC = 'GC4j.Memory.Tenured.BeforeGC';
var ECS_MEMORY_TENURED_AFTER_GC = 'GC4j.Memory.Tenured.AfterGC';
var ECS_MEMORY_TENURED_TOTAL = 'GC4j.Memory.Tenured.Total';
var ECS_MEMORY_HEAP_BEFORE_GC = 'GC4j.Memory.Heap.BeforeGC';
var ECS_MEMORY_HEAP_AFTER_GC = 'GC4j.Memory.Heap.AfterGC';
var ECS_MEMORY_HEAP_TOTAL = 'GC4j.Memory.Heap.Total';
var ECS_MEMORY_METASPACE_BEFORE_GC = 'GC4j.Memory.Metaspace.BeforeGC';
var ECS_MEMORY_METASPACE_AFTER_GC = 'GC4j.Memory.Metaspace.AfterGC';
var ECS_MEMORY_METASPACE_TOTAL = 'GC4j.Memory.Metaspace.Total';
var ECS_PAUSE_TIME = 'GC4j.PauseTime';

// canonical name => processor(rawName, beatEvent, content)
var GC_EVENT_PROCESSORS = {};

// registered gc event factories
var GC_EVENT_FACTORIES = [];

// INIT
(function() {
  GC_EVENT_FACTORIES.push(basicGCEventFactory);
})();

// PROCESSOR API IMPLAMENTATIONS

function register(params) {
  debug = !!(params.debug);
}

function process(event) {
  var parseInfo = new ParseInfo(event.Get('message'));
  var baseGCEvent = new GCEvent(function(beatEvent) {
    if (this.datestamp != null) {
      beatEvent.Put('@timestamp', this.datestamp);
    }
    beatEvent.Put(ECS_TIMESTAMP, this.timestamp);
  });

  parseDateStamp(parseInfo, baseGCEvent);
  parseTimeStamp(parseInfo, baseGCEvent);

  if (!baseGCEvent.timestamp) {
      if (debug)
        throw 'Can not parse gc timestamp at pos: ' + parseInfo.pos;

    // no gc timestamp find skip this event
    return;
  }

  var gcEvents = [];
  parseGCEvent(parseInfo, gcEvents);

  if (gcEvents.length == 0)
    return;

  gcEvents.push(baseGCEvent);
  for (var i = 0, len = gcEvents.length; i < len; i++) {
    gcEvents[i].process(event);
  }
}

function MessageParser(message) {
  this.message = message;
}

MessageParser.prototype.parse = function() {
  var eventStack = [];
  var m = this.message;
  var c, eventName;
  for (var i = 0, len = m.length; i < len; i++) {
    c = m[i];
    if ('[' == c) {
      eventName = this.parseEventName(i);
    } else if (']' == c) {

    }
  }

  while (pos < len) {
    var char = m[pos];

    if ()
  }

  switch (m[this.pos]) {
  case '[':
    this.bracketPairs[this.pos] = -1;
    this.bracketStack.push(this.pos);
    break;
  case ']':
    var lb = this.bracketStack.pop();
    if (debug && lb == undefined) {
      throw 'Invalid bracket pair for right bracket at position:' + this.pos;
    }
    this.bracketPairs[lb] = this.pos;
    break;
  }

  return m[this.pos++];
}

MessageParser.prototype.parseEventName = function(pos) {
  var startPos = pos;
  var m = this.message;

  // check whether the type name starts with a number
  // e.g. 0.406: [GC [1 CMS-initial-mark: 7664K(12288K)] 7666K(16320K), 0.0006855 secs]
  while (isDigitCharCode(m.charCodeAt(pos++))) ;

  var cStartPos = pos;
  var c;
  for (var len = m.length; pos < len; pos++) {
    c = m[pos];
    if (c == '[' || c == ']') {
      // back to '[' or ']' for parsing
      pos--;
      break;
    } else if (c == '(' || c == ')' || c == ':' || c== ',' || isDigitChar(c))
      break;
  }

  return {
    canonical: m.substring(cStartPos, pos).trim(),
    raw: m.substring(startPos, pos)
  };
}

// GC EVENT FACTORIES

var GC_MEMORY_YOUNG = 'young';
var GC_MEMORY_TENURED = 'tenured';
var GC_MEMORY_METASPACE = 'metaspace';

var YOUNG_GC_EVENT_SET = {
  'ParNew': true,
  'DefNew': true
};
var TENURED_GC_EVENT_SET = {
  'CMS-initial-mark': true,
  'CMS-remark': true
};

/**
 * only record stw pause time and memory useage
 *
 * @param ParseInfo parseInfo
 * @param Array events container of parsed gc event. required to push parsed event to this container
 *
 * @return null|GCEvent
 */
function basicGCEventFactory(parseInfo, events) {
  var leftBracketPos, rightBracketPos;
  leftBracketPos = parseInfo.pos - 1;

  var eventStr = parseEventString(parseInfo);
  var gcEvent = null;
  var memoryType;

  if (eventStr.indexOf('GC') == 0 || eventStr.indexOf('Full GC') == 0) {
    while ((rightBracketPos = parseInfo.bracketPairs[leftBracketPos]) == -1 && !parseInfo.isEnd()) {
      parseGCEvent(parseInfo, events);
    }

    if (debug && rightBracketPos == -1 && parseInfo.isEnd())
      throw 'Invalid bracket pair for left bracket at position: ' + startPos;

    // find previous ']'
    var prevRightBracketPos = -1;
    for (var lbp in parseInfo.bracketPairs) {
      var p = parseInfo.bracketPairs[lbp];
      if (p >= rightBracketPos)
        continue;

      prevRightBracketPos = p > prevRightBracketPos ? p : prevRightBracketPos;
    }

    if (prevRightBracketPos == -1) {
      if (debug)
        throw 'Can not find previous ] at position: ' + rightBracketPos;

      return null;
    }

    var parseStr = parseInfo.message.substring(prevRightBracketPos, rightBracketPos);
    gcEvent = new GCEvent(basicGCEventProcessor);
    parseMemory(parseStr, gcEvent);
    parsePauseTime(parseStr, gcEvent);
  } else if (YOUNG_GC_EVENT_SET[eventStr]) {
    memoryType = GC_MEMORY_YOUNG;
  } else if (TENURED_GC_EVENT_SET[eventStr]) {
    memoryType = GC_MEMORY_TENURED;
  } else if (eventStr.indexOf('Metaspace') == 0) {
    memoryType = GC_MEMORY_METASPACE;
  }

  if (memoryType) {
    gcEvent = new GCEvent(basicGCEventProcessor);
    gcEvent.memoryType = memoryType;
    rightBracketPos = findRigthBracket(leftBracketPos, parseInfo);
    parseMemory(parseInfo.message.substring(leftBracketPos, rightBracketPos), gcEvent);
  }

  return gcEvent;
}

function basicGCEventProcessor(beatEvent) {
  var beforeGCKey, afterGCKey, totalGCKey;
  if (this.memoryType == GC_MEMORY_YOUNG) {
    beforeGCKey = ECS_MEMORY_YOUNG_BEFORE_GC;
    afterGCKey = ECS_MEMORY_YOUNG_AFTER_GC;
    totalGCKey = ECS_MEMORY_YOUNG_TOTAL;
  } else if (this.memoryType == GC_MEMORY_TENURED) {
    beforeGCKey = ECS_MEMORY_TENURED_BEFORE_GC;
    afterGCKey = ECS_MEMORY_TENURED_AFTER_GC;
    totalGCKey = ECS_MEMORY_TENURED_TOTAL;
  } else if (this.memoryType == GC_MEMORY_METASPACE) {
    beforeGCKey = ECS_MEMORY_METASPACE_BEFORE_GC;
    afterGCKey = ECS_MEMORY_METASPACE_AFTER_GC;
    totalGCKey = ECS_MEMORY_METASPACE_TOTAL;
  } else {
    beforeGCKey = ECS_MEMORY_HEAP_BEFORE_GC;
    afterGCKey = ECS_MEMORY_HEAP_AFTER_GC;
    totalGCKey = ECS_MEMORY_HEAP_TOTAL;
  }

  if (this.memoryBeforeGC) {
    beatEvent.Put(beforeGCKey, this.memoryBeforeGC);
  }
  if (this.memoryAfterGC) {
    beatEvent.Put(afterGCKey, this.memoryAfterGC);
  }
  if (this.memoryTotal) {
    beatEvent.Put(totalGCKey, this.memoryTotal);
  }
  if (this.pauseTime) {
    beatEvent.Put(ECS_PAUSE_TIME, this.pauseTime);
  }
}

function ParseInfo(message) {
  this.message = message;
  this.pos = 0;
  this.bracketPairs = {};
  this.bracketStack = [];
}

ParseInfo.prototype.equalsAt = function(pos, str) {
  return this.message.substring(pos, pos + str.length) == str;
};

ParseInfo.prototype.isEnd = function() {
  return this.pos >= this.message.length;
}

ParseInfo.prototype.next = function(skipBlanks) {
  var m = this.message;

  if (!!skipBlanks) {
    while (m[this.pos] == ' ')
      this.pos++;
  }

  if (this.pos >= m.length)
    return null;

  switch (m[this.pos]) {
  case '[':
    this.bracketPairs[this.pos] = -1;
    this.bracketStack.push(this.pos);
    break;
  case ']':
    var lb = this.bracketStack.pop();
    if (debug && lb == undefined) {
      throw 'Invalid bracket pair for right bracket at position:' + this.pos;
    }
    this.bracketPairs[lb] = this.pos;
    break;
  }

  return m[this.pos++];
};

function GCEvent(eventProcessor) {
  this.process = eventProcessor.bind(this);
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

var timeStampRegExp = /^\d*\.\d*/;
// enough to hold to timestamp string
var LENGTH_OF_TIMESTAMP = 20;

function parseTimeStamp(pi, gcEvent) {
  var tsStr = pi.message.substring(pi.pos, pi.pos + LENGTH_OF_TIMESTAMP);
  var r = timeStampRegExp.exec(tsStr);
  var ts;
  if (r && (ts = r[0]) && pi.equalsAt(pi.pos + ts.length, ': ')) {
    gcEvent.timestamp = ts;

    // pass the following ": "
    pi.pos += (ts.length + 2)
  }
}

function parseGCEvent(pi, events) {
  var char;
  while ((char = pi.next(true)) != null && char != '[')
    continue;

  if (char == null)
    return;

  for (var i = 0, len = GC_EVENT_FACTORIES.length; i < len; i++) {
    var event = GC_EVENT_FACTORIES[i](pi, events);
    if (event != null) {
      events.push(event);
      break;
    }
  }
}

function parseEventString(pi) {
  var m = pi.message;

  // check whether the type name starts with a number
  // e.g. 0.406: [GC [1 CMS-initial-mark: 7664K(12288K)] 7666K(16320K), 0.0006855 secs]
  while (isDigitCharCode(m.charCodeAt(pi.pos)))
    pi.pos++;

  var startPos = pi.pos;
  var c;
  var inParanthesis = false;
  while ((c = pi.next(true)) != null) {
    if (c == '(' || inParanthesis || c == ')') {
      // option "-XX:+PrintPromotionFailure" inserts text in parentheses between "ParNew" and "(promotion failed)"
      // [ParNew (0: promotion failure size = 4098)  (1: promotion failure size = 4098)  (2: promotion failure size = 4098) (promotion failed):
      // parsing must not stop until end of (promotion failed)...
      inParanthesis = (c != ')');
      continue;
    }
    if (c == ':' || c == '[' || c == ']' || c== ',' || isDigitChar(c))
      break;
  }

  // back 1 position
  pi.pos--;

  return m.substring(startPos, pi.pos).trim();
}

// 0: 48 9: 57
function isDigitCharCode(charCode) {
  return charCode > 47 && charCode < 58;
}

function isDigitChar(char) {
  return isDigitCharCode(char.charCodeAt(0));
}

function findRigthBracket(leftBracketPos, parseInfo) {
  var rightBracketPos = parseInfo.bracketPairs[leftBracketPos];
  if (rightBracketPos > 0) {
    return rightBracketPos;
  }

  var char;
  while ((char = parseInfo.next(true)) != null && parseInfo.bracketPairs[leftBracketPos] == -1)
    continue;

  return parseInfo.pos;
}

var memoryRegExp = /((\d*)K->)?(\d*)K\((\d*)K\)/;
function parseMemory(content, gcEvent) {
  var r = memoryRegExp.exec(content);
  if (!r)
    return;

  if (r[2]) {
    gcEvent.memoryBeforeGC = r[2];
  }
  gcEvent.memoryAfterGC = r[3];
  gcEvent.memoryTotal = r[4];
}

var pauseTimeRegExp = /(\d*\.\d*) sec/;
function parsePauseTime(content, gcEvent) {
  var r = pauseTimeRegExp.exec(content);
  if (r && r[1]) {
    gcEvent.pauseTime = r[1];
  }
}
