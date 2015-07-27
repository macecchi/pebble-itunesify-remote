var gui = require('nw.gui');

var tray = new gui.Tray({
    title: 'Remote'
});
var menu = new gui.Menu();
menu.append(new gui.MenuItem({
    type: 'checkbox',
    label: 'Always-on-top',
    click: function () { }
  }));
tray.menu = menu;

console.log('done');