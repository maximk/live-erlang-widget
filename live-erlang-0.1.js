(function() {
	var live_uri = 'ws://i.erlangonxen.org:9706/live';

	var prepare_window = function(erl) {
		if (erl.tabIndex == -1)
			erl.tabIndex = 0;

		erl.style.overflow = 'auto';

		erl.innerHTML = '<div>[Powered by '+
				'<a href="http://github.com/maximk/live-erlang-widget">'+
					'Erlang on Xen</a>]</div>';

		var cursor = document.createElement('div');
		cursor.style.display = 'none'; //'inline-block'
		cursor.style.verticalAlign = 'text-bottom';
		cursor.style.width = '1px';
		cursor.style.height = '1em';
		cursor.style.backgroundColor = '#111';
		erl.appendChild(cursor);

		var focus_handler = function(ev) {
			cursor.style.display = 'inline-block';
		};

		var focusout_handler = function() {
			cursor.style.display = 'none';
		};

		erl.addEventListener('focus', focus_handler);
		erl.addEventListener('focusout', focusout_handler);

		var insert_text = function(str) {
			if (str == '')
				return;
			var node = cursor.previousSibling;
			if (node == null || node.nodeType != Node.TEXT_NODE) {
				node = document.createTextNode(str);
				erl.insertBefore(node, cursor);
			} else {
				node.nodeValue += str;
			}
		};

		var text_insert = function(str) {
			var node = cursor.nextSibling;
			if (node == null) {
				node = document.createTextNode(str);
				erl.appendChild(node);
			} else {
				node.nodeValue = str +node.nodeValue;
			}
		};

		var insert_newline = function() {
			var newline = document.createElement('br');
			erl.insertBefore(newline, cursor);
		};

		var bad_escape = function(selector, param) {
			throw 'Bad escape sequence: ^[' +param +selector;
		};

		var apply_escape = function(selector, param) {
			if (selector == 'h') {
				if (param != 4)
					bad_escape(selector, param);
				// enter insert mode - ignore
			} else if (selector == 'l') {
				if (param != 4)
					bad_escape(selector, param);
				// leave insert mode - ignore
			} else if (selector == 'D') {
				//console.log('LEFT '+param);
				if (param == 0)
					return;
				var leftNode = cursor.previousSibling;
				if (leftNode.nodeType != Node.TEXT_NODE
						|| leftNode.nodeValue.length < param)
					bad_escape(selector, param);
				var aaa = leftNode.nodeValue.substr(0, leftNode.nodeValue.length-param);
				var bbb = leftNode.nodeValue.substr(-param);
				leftNode.nodeValue = aaa;
				text_insert(bbb);
			} else if (selector == 'C') {
				//console.log('RIGHT '+param);
				if (param == 0)
					return;
				var rightNode = cursor.nextSibling;
				if (rightNode == null || rightNode.nodeType != Node.TEXT_NODE
						|| rightNode.nodeValue.length < param)
					bad_escape(selector, param);
				var aaa = rightNode.nodeValue.substr(0, param);
				var bbb = rightNode.nodeValue.substr(param);
				rightNode.nodeValue = bbb;
				insert_text(aaa);
			} else if (selector == 'P') {
				//console.log('DELETE '+param);
				if (param == 0)
					return;
				var rightNode = cursor.nextSibling;
				if (rightNode == null || rightNode.nodeType != Node.TEXT_NODE
						|| rightNode.nodeValue.length < param)
					bad_escape(selector, param);
				var bbb = rightNode.nodeValue.substr(param);
				if (bbb != '')
					rightNode.nodeValue = bbb;
				else
					erl.removeChild(rightNode);
			} else {
				bad_escape(selector, param);
			}
		};

		// 0 - initial/normal
		// 1 - was ESC
		// 2 - was ESC [
		var state = 0;
		var buffer = '';
		var param;

		var input_machine = function(ch) {
			if (state == 0 && ch == '') {
				insert_text(buffer);
				buffer = '';
			} else if (state == 0 && ch == '\n') {
				insert_text(buffer);
				insert_newline();
				buffer = '';
			} else if (state == 0 && ch == '\x1b') {
				insert_text(buffer);
				buffer = '';
				state = 1;
			} else if (state == 0 && ch == '\x07') {	// beep
				// ignore
			} else if (state == 0) {
				buffer += ch;
			} else if (state == 1 && ch == '[') {
				state = 2;
				param = 0;
			} else if (state == 1 && ch == '\x1b') {
				insert_text('\x1b');
			} else if (state == 1 && ch == '\n') {
				insert_text('\x1b');
				insert_newline();
			} else if (state == 1) {
				insert_text('\x1b'+ch);
			} else if (state == 2 && ch >= '0' && ch <= '9') {
				param *= 10;
				param += parseInt(ch);
			} else if (state == 2) {
				apply_escape(ch, param);
				state = 0;
			}
		};

		var keydown_handler = function(ev) {
			if (ev.which == 37) {			// left
				web_sock.send('\x1b[D');
				ev.preventDefault();
			} else if (ev.which == 38) { 	// up
				web_sock.send('\x1b[A');
				ev.preventDefault();
			} else if (ev.which == 39) {	// right
				web_sock.send('\x1b[C');
				ev.preventDefault();
			} else if (ev.which == 40) {	// down
				web_sock.send('\x1b[B');
				ev.preventDefault();
			} else if (ev.which == 8) {
				web_sock.send('\x08');
				ev.preventDefault();
			} else if (ev.which == 71 && ev.ctrlKey) {
				web_sock.send('\x07');
				ev.preventDefault();
			}
		};

		var keypress_handler = function(ev) {
			if (ev.which == 13)
				web_sock.send('\n');
			else if (ev.which != 0) {
				//console.log('SEND '+ev.which);
				web_sock.send(String.fromCharCode(ev.which));
			}
		};

		erl.addEventListener('keydown', keydown_handler);
		erl.addEventListener('keypress', keypress_handler);

		var uri = live_uri;
		if (erl.dataset.image !== undefined)
			uri += '?image='+erl.dataset.image;

		var web_sock = null;

		if ('MozWebSocket' in window)
			web_sock = new MozWebSocket(uri);
		else if ('WebSocket' in window)
			web_sock = new WebSocket(uri);
			
		if (web_sock == null)
		{
			alert('The demo uses WebSocket API and your browser is either does' +
				  ' not support it or have the API disabled. Please use a more' +
				  ' recent browser or turn on WebSocket API.');
		}
		else
		{
			web_sock.onmessage = function(ev) {
				for (var i = 0; i < ev.data.length; i++) {
					//console.log('RECEIVE '+ev.data.charCodeAt(i));
					input_machine(ev.data[i]);
				}
				input_machine('');

				// make cursor visible
				erl.scrollTop = erl.scrollHeight -erl.clientHeight;
			};

			web_sock.onclose = function(ev) {
				erl.removeEventListener('focusout', focusout_handler);
				erl.removeEventListener('focus', focus_handler);
				erl.removeEventListener('keypress', keypress_handler);
				erl.removeEventListener('keydown', keydown_handler);

				if (ev.code == 1000)
					erl.innerHTML = '[Disconnected]';
				else
					erl.innerHTML ='[Service unavailable: '+ev.code+']';
			};
		}

	};

	var list = document.querySelectorAll('.live-erlang');
	for (var i = 0; i < list.length; i++)
		prepare_window(list.item(i));
})();
