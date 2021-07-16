var debug = false;

// ecs field names
var ECS_TIMESTAMP = 'GC4j.Timestamp';
var ECS_MEMORY_YOUNG_BEFORE_GC = 'GC4j.Memory.Young.BeforeGC';
var ECS_MEMORY_YOUNG_AFTER_GC = 'GC4j.Memory.Young.AfterGC';
var ECS_MEMORY_YOUNG_TOTAL = 'GC4j.Memory.Young.Total';
var ECS_MEMORY_TENURED_BEFORE_GC = 'GC4j.Memory.Tenured.BeforeGC';
var ECS_MEMORY_TENURED_AFTER_GC = 'GC4j.Memory.Tenured.AfterGC';
var ECS_MEMORY_TENURED_TOTAL = 'GC4j.Memory.Tenured.Total';
var ECS_MEMORY_PERM_BEFORE_GC = 'GC4j.Memory.Perm.BeforeGC';
var ECS_MEMORY_PERM_AFTER_GC = 'GC4j.Memory.Perm.AfterGC';
var ECS_MEMORY_PERM_TOTAL = 'GC4j.Memory.Perm.Total';
var ECS_MEMORY_HEAP_BEFORE_GC = 'GC4j.Memory.Heap.BeforeGC';
var ECS_MEMORY_HEAP_AFTER_GC = 'GC4j.Memory.Heap.AfterGC';
var ECS_MEMORY_HEAP_TOTAL = 'GC4j.Memory.Heap.Total';
var ECS_YOUNG_PAUSE_TIME = 'GC4j.PauseTime.Young';
var ECS_TENURED_PAUSE_TIME = 'GC4j.PauseTime.Tenured';
var ECS_TOTAL_PAUSE_TIME = 'GC4j.PauseTime.Total';
var ECS_GC_TYPE = 'GC4j.GCType';

var GC_TYPE_MINOR = 'minor';
var GC_TYPE_MAJOR = 'major';
var GC_TYPE_FULL = 'full';

var MEMORY_HEAP = 'heap'
var MEMORY_YOUNG = 'young';
var MEMORY_TENURED = 'tenured';
var MEMORY_PERM = 'metaspace';

var gcTypeMapper = {
  GC_TYPE_MINOR: 'Minor GC',
  GC_TYPE_MAJOR: 'Major GC',
  GC_TYPE_FULL: 'Full GC'
};

// canonical name => void processor(BeatEvent, GCEventNode)
var GC_EVENT_PROCESSORS = {};

var ROOT_EVENT_NAME = '__ROOT__';

// INIT
(function() {
  GC_EVENT_PROCESSORS[ROOT_EVENT_NAME] = function(beatEvent, gcEventNode) {
    var parser = gcEventNode.parser;
    if (parser.datestamp) {
      beatEvent.Put('@timestamp', parser.datestamp);
    }

    beatEvent.Put(ECS_TIMESTAMP, parser.timestamp);
  };

  GC_EVENT_PROCESSORS['GC'] = function(beatEvent, gcEventNode) {
    var childNodes = gcEventNode.children;
    var startPos = childNodes.length > 0 ? childNodes[childNodes.length-1].endPos : gcEventNode.startPos;
    var content = gcEventNode.parser.message.substring(startPos, gcEventNode.endPos);
    recordMemoryInfo(parseMemory(content, MEMORY_HEAP), beatEvent);
    recordPauseTime(parsePauseTime(content), beatEvent, ECS_TOTAL_PAUSE_TIME);

    var gcType = childNodes.length > 0 && childNodes[0].gcType;
    recordGCType(gcType ? gcType : GC_TYPE_MINOR, beatEvent);
  };

  GC_EVENT_PROCESSORS['Full GC'] = function(beatEvent, gcEventNode) {
    var content = gcEventNode.text();
    recordMemoryInfo(parseMemory(content, MEMORY_HEAP), beatEvent);
    recordPauseTime(parsePauseTime(content), beatEvent, ECS_TOTAL_PAUSE_TIME);
    recordGCType(GC_TYPE_FULL, beatEvent);
  };

  // YOUNG GC
  var youngGCProcessor = function(beatEvent, gcEventNode) {
    var content = gcEventNode.text();
    recordMemoryInfo(parseMemory(content, MEMORY_YOUNG), beatEvent);
    recordPauseTime(parsePauseTime(content), beatEvent, ECS_YOUNG_PAUSE_TIME);

    gcEventNode.gcType = GC_TYPE_MINOR;
  };
  GC_EVENT_PROCESSORS['ParNew'] = youngGCProcessor;
  GC_EVENT_PROCESSORS['DefNew'] = youngGCProcessor;
  GC_EVENT_PROCESSORS['PSYoungGen'] = youngGCProcessor;

  // TENURED GC

  var tenuredGCProcessor = function(beatEvent, gcEventNode) {
    var content = gcEventNode.text();
    recordMemoryInfo(parseMemory(content, MEMORY_TENURED), beatEvent);
    recordPauseTime(parsePauseTime(content), beatEvent, ECS_TENURED_PAUSE_TIME);

    gcEventNode.gcType = GC_TYPE_MAJOR;
  };

  // CMS GC
  GC_EVENT_PROCESSORS['CMS-initial-mark'] = tenuredGCProcessor;
  GC_EVENT_PROCESSORS['CMS-remark'] = tenuredGCProcessor;
  GC_EVENT_PROCESSORS['CMS'] = tenuredGCProcessor;

  GC_EVENT_PROCESSORS['ParOldGen'] = tenuredGCProcessor;

  // METASPACE / PERM GC

  GC_EVENT_PROCESSORS['Metaspace'] = function(beatEvent, gcEventNode) {
    recordMemoryInfo(parseMemory(gcEventNode.text(), MEMORY_PERM), beatEvent);
  };
})();

// PROCESSOR API IMPLAMENTATIONS

function register(params) {
  debug = !!(params.debug);
}

function process(event) {
  new MessageParser(event.Get('message')).parse(event);
}

function MessageParser(message) {
  this.message = message;
  this.pos = 0;
  this.datestamp;
  this.timestamp;
}

MessageParser.prototype.parse = function(beatEvent) {
  var processor;
  var rootNode, currNode;
  var m = this.message;
  var char;

  this.parseDateStamp();
  this.parseTimeStamp();

  // skip message if no timestamp find
  if (!this.timestamp) {
    if (debug)
      throw 'can not find timestamp info for this message';
    return;
  }

  // root event
  rootNode = currNode = new GCEventNode(ROOT_EVENT_NAME, 0, null, this);

  for (var len = m.length; this.pos < len; this.pos++) {
    char = m[this.pos];
    if ('[' == char) {
      var startPos = this.pos;

      // skip '[' for parsing event name
      this.pos++;
      var eventName = this.parseEventName();
      currNode = new GCEventNode(eventName, startPos, currNode, this);
    } else if (']' == char) {
      currNode.endPos = this.pos;
      if (processor = GC_EVENT_PROCESSORS[currNode.name]) {
        processor(beatEvent, currNode);
      }

      currNode = currNode.parent;
    }
  }

  // process root node
  if (processor = GC_EVENT_PROCESSORS[ROOT_EVENT_NAME]) {
    processor(beatEvent, rootNode);
  }

  if (debug && rootNode != currNode) {
    throw 'Mismatching bracket pairs';
  }
}

MessageParser.prototype.parseEventName = function() {
  var pos = this.pos;
  var m = this.message;

  while (m[this.pos++] == ' ')
    continue;

  // check whether the type name starts with a number
  // e.g. 0.406: [GC [1 CMS-initial-mark: 7664K(12288K)] 7666K(16320K), 0.0006855 secs]
  while (isDigitCharCode(m.charCodeAt(this.pos++))) ;

  var cStartPos = pos;
  var c;
  for (var len = m.length; this.pos < len; this.pos++) {
    c = m[this.pos];
    if (c == '[' || c == ']') {
      // back to '[' or ']' for parsing
      this.pos--;
      break;
    } else if (c == '(' || c == ')' || c == ':' || c== ',' || isDigitChar(c))
      break;
  }

  return m.substring(cStartPos, this.pos).trim();
}

// find and convert 2021-05-31T22:05:40.007+0800 to 2021-05-31T22:05:40.007Z for @timestamp
var LENGTH_OF_DATESTAMP = 28;
MessageParser.prototype.parseDateStamp = function() {
  var m = this.message;
  if (m[4] == '-' && m[7] == '-') {
    var date = new Date(m.substring(0, LENGTH_OF_DATESTAMP));
    if (date) {
      this.datestamp = date;
      // pass the following ": "
      this.pos = LENGTH_OF_DATESTAMP + 2;
    }
  }
}

var timeStampRegExp = /^\d*\.\d*/;
// enough to hold to timestamp string
var LENGTH_OF_TIMESTAMP = 20;
MessageParser.prototype.parseTimeStamp = function() {
  var tsStr = this.message.substring(this.pos, this.pos + LENGTH_OF_TIMESTAMP);
  var r = timeStampRegExp.exec(tsStr);
  var ts;
  if (r && (ts = r[0]) && this.message.indexOf(': ', this.pos + ts.length)) {
    this.timestamp = ts;

    // pass the following ": "
    this.pos += (ts.length + 2)
  }
}

function GCEventNode(name, startPos, parent, parser) {
  this.name = name;
  this.startPos = startPos;
  this.endPos = -1;
  this.parent = parent;
  this.parser = parser;
  this.children = [];
  this.gcType;

  if (parent) {
    parent.children.push(this);
  }
}

/**
 * Text that not include child nodes
 *
 * @param sep Seperator used to gulp text between child nodes, default is space
 */
GCEventNode.prototype.text = function(sep) {
  if (this.children.length == 0) {
    return this.parser.message.substring(this.startPos, this.endPos);
  }

  sep = sep || ' ';

  var text = '';
  var m = this.parser.message;
  var pos, child;
  for (var i = 0, len = this.children.length; i < len; i++) {
    child = this.children[i];
    if (!pos) {
      text += sep + m.substring(this.startPos, child.startPos);
    } else {
      text += sep + m.substring(pos, child.startPos);
    }
    pos = child.endPos;
  }

  return text + sep + m.substring(pos, this.endPos);
}

function recordMemoryInfo(memoryInfo, beatEvent) {
  if (!memoryInfo)
    return;

  var beforeGCKey, afterGCKey, totalGCKey;
  if (memoryInfo.type == MEMORY_YOUNG) {
    beforeGCKey = ECS_MEMORY_YOUNG_BEFORE_GC;
    afterGCKey = ECS_MEMORY_YOUNG_AFTER_GC;
    totalGCKey = ECS_MEMORY_YOUNG_TOTAL;
  } else if (memoryInfo.type == MEMORY_TENURED) {
    beforeGCKey = ECS_MEMORY_TENURED_BEFORE_GC;
    afterGCKey = ECS_MEMORY_TENURED_AFTER_GC;
    totalGCKey = ECS_MEMORY_TENURED_TOTAL;
  } else if (memoryInfo.type == MEMORY_PERM) {
    beforeGCKey = ECS_MEMORY_PERM_BEFORE_GC;
    afterGCKey = ECS_MEMORY_PERM_AFTER_GC;
    totalGCKey = ECS_MEMORY_PERM_TOTAL;
  } else {
    beforeGCKey = ECS_MEMORY_HEAP_BEFORE_GC;
    afterGCKey = ECS_MEMORY_HEAP_AFTER_GC;
    totalGCKey = ECS_MEMORY_HEAP_TOTAL;
  }

  if (memoryInfo.beforeGC) {
    beatEvent.Put(beforeGCKey, memoryInfo.beforeGC);
  }
  if (memoryInfo.afterGC) {
    beatEvent.Put(afterGCKey, memoryInfo.afterGC);
  }
  if (memoryInfo.total) {
    beatEvent.Put(totalGCKey, memoryInfo.total);
  }
}

function recordPauseTime(pauseTime, beatEvent, ecsField) {
  if (pauseTime) {
    beatEvent.Put(ecsField, pauseTime);
  }
}

function recordGCType(gcType, beatEvent) {
  if (gcType) {
    beatEvent.Put(ECS_GC_TYPE, gcTypeMapper[gcType]);
  }
}

// 0: 48 9: 57
function isDigitCharCode(charCode) {
  return charCode > 47 && charCode < 58;
}

function isDigitChar(char) {
  return isDigitCharCode(char.charCodeAt(0));
}

var memoryRegExp = /((\d*)K->)?(\d*)K\((\d*)K\)/;
function parseMemory(content, memoryType) {
  var r = memoryRegExp.exec(content);
  if (!r)
    return null;

  var result = {
    type: memoryType
  };

  if (r[2]) {
    result.beforeGC = r[2];
  }
  result.afterGC = r[3];
  result.total = r[4];

  return result;
}

var pauseTimeRegExp = /(\d*\.\d*) sec/;
function parsePauseTime(content) {
  var r = pauseTimeRegExp.exec(content);
  if (r && r[1]) {
    return r[1];
  }

  return null;
}
