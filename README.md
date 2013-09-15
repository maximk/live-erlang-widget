
# Live Erlang widget

The widget adds a live Erlang console to your webiste. The console connects
to a virtual [Erlang on Xen](http://erlangonxen.org) instance. A new instance
gets created upon each web page load. Instance are destroyed immediately when
the web page closes.

The purpose of the Live Erlang widget is to help people to try Erlang with
minimum effort. With the widget, web-based Erlang training can be made more
interactive.

## How to use

First add to your webpage a div that has 'live-erlang' class:

	...
	<div class="live-erlang"></div>
	...

You can size and style the div the way you want. Now add the live-erlang
script right before the end of the document body:

		...
		<script src="/js/live-erlang-0.1.js"></script>
	</body>

This is it. Note that you may have multiple Live Erlang consoles on a single
web page.

## How to customize

The widget can use different images for each console. The image type is specified
using the data-image attribute:

	<div class="live-erlang" data-image="standard"></div>

The only image type avaiable today is 'standard'. If you need a custom image,
which, for instance, contains specific modules or files, please, contact us at
info@erlangonxen.org.

## Widget in action

See [i.erlangonxen.org](http://i.erlangonxen.org).

