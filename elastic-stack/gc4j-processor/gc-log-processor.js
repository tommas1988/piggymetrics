var timeRegExp = /(^\d.*?)\:\s\[/;

function process(event) {
  var message = event.Get('message');
  var matches;

  if ((matches = timeRegExp.exec(message)) == null)
    return;

  event.Put('gc.time', matches[1]);
}
