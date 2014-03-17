var myExt = {};

myExt.gid = function (id) {
  return document.getElementById(id.toString());
};

myExt.el = {
  form: myExt.gid('ext'),
  input: myExt.gid('ext-filter'),
  list: myExt.gid('ext-list'),
  style: myExt.gid('filter-style')
};

myExt.listTpl = myExt.gid('extension-tpl').textContent;
myExt.filterTpl = myExt.gid('filter-tpl').textContent;

myExt.enableExt = function (_input) {
  chrome.management.get(_input.id, function (item) {
    chrome.management.setEnabled(item.id, !item.enabled, function () {
      var _label = _input.parentElement,
          _lists = myExt.el.list;

      _label.classList.toggle('ext-disabled');

      // myExt.generateList();
      if (item.enabled) {
        _lists.insertBefore(_label, _lists.children[_lists.childElementCount - 1]);
      } else {
        _lists.insertBefore(_label, _lists.children[0]);
      }
    });
  });
};

myExt.filter = function (kwd) {
  var _pattern = new RegExp(kwd.toString(), 'ig');
};

myExt.replaceTpl = function (str, obj) {
  var pattern = /\#{(.+?)}/g;
  return str.replace(pattern, function( match ) {
      return obj[match.replace(pattern, '$1')];
  } );
};

myExt.generateList = function () {
  chrome.management.getAll(function (items) {
    var listArr = [], _o;
    for (var i = items.length - 1; i >= 0; i--) {
      _o = {
        id: items[i].id,
        class: items[i].enabled ? '' : 'ext-disabled',
        title: items[i].name.toLocaleLowerCase(),
        bgi: items[i].icons ? items[i].icons[0].url : 'default_icon.png',
        name: items[i].name,
        checked: items[i].enabled ? 'checked' : ''
      };

      listArr[i] = myExt.replaceTpl(myExt.listTpl, _o);
    }

    myExt.el.list.innerHTML = listArr.join('');
  });
};

myExt.el.list.addEventListener('change', function(event) {
  var _this = event.target;
  if ('input' !== _this.nodeName.toLocaleLowerCase()) { return; }
  myExt.enableExt(_this);
});

myExt.el.input.addEventListener('input', function () {
  var _newFilter = '',
      _val = myExt.el.input.value.replace(/^\s+|\s+$/g, '');

  if ('' !== _val) {
    _newFilter = myExt.replaceTpl(myExt.filterTpl, {kwd: _val});
  }

  myExt.el.style.innerHTML = _newFilter;
});

myExt.el.list.addEventListener('contextmenu', function(event) {
  var _this = event.target;
  if ('label' !== _this.nodeName.toLocaleLowerCase()) { return; }

    console.log(_this.getAttribute('for'));
  if (confirm(myExt.replaceTpl(chrome.i18n.getMessage('msg_check_uninstall'), {name: _this.textContent.replace(/\n|\r|\s/gm, '')}))) {
    chrome.management.uninstall(_this.getAttribute('for'), myExt.generateList);
  }
  event.preventDefault();
});

myExt.generateList();