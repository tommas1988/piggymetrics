var test_messages = [
  "2.791: [GC (Allocation Failure) 2.792: [ParNew: 13687K->765K(15360K), 0.0009836 secs] 13687K->765K(49536K), 0.0010908 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] ",
  "2.832: [GC (CMS Initial Mark)  (Survivor:5chunks) Finished young gen initial mark scan work in 3th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 4th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 5th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 3th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 4th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 5th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 0th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 0th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 2th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 1th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 2th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 1th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 6th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 6th thread: 0.000 sec\n" +
"Finished young gen initial mark scan work in 7th thread: 0.000 sec\n" +
"Finished remaining root initial mark scan work in 7th thread: 0.000 sec\n" +
"[1 CMS-initial-mark: 19087K(34176K)] 21072K(49536K), 0.0003974 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] ",
  "2.969: [Full GC (Allocation Failure) 2.969: [CMS: 34138K->34138K(34176K), 0.0062542 secs] 49372K->49300K(49536K), [Metaspace: 4138K->4138K(1056768K)], 0.0063640 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] ",
  "2.853: [GC (Allocation Failure) 2.853: [ParNew: 15262K->15262K(15360K), 0.0000220 secs]2.853: [CMS (cardTable: 3 cards, re-scanned 3 cards, 1 iterations)\n" +
 "[1 iterations, 1 waits, 3 cards)] 2.953: [CMS-concurrent-abortable-preclean: 0.018/0.119 secs] (CMS-concurrent-abortable-preclean yielded 1 times)\n" +
 "[Times: user=0.01 sys=0.00, real=0.12 secs] \n" +
 "(concurrent mode failure): 19087K->34138K(34176K), 0.1139879 secs] 34350K->34237K(49536K), [Metaspace: 4138K->4138K(1056768K)], 0.1141305 secs] [Times: user=0.01 sys=0.01, real=0.12 secs] "
];

var BeatEvent = {
  Put: function(key, value) {
    console(key + ' = ' + value);
  },

  Get: function(key) {
    return this[key];
  }
}

for (var i = 0; i < test_messages.length; i++) {
  BeatEvent.message = test_messages[i];
  process(BeatEvent);
}
