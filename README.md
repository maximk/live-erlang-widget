
# A Live Erlang widget

The widget adds a live Erlang console to your webiste. The console connects
to a virtual Erlang on Xen instance. A new instance gets created upon each
web page load. Instance are destroyed immediately when the web page closes.

The purpose of the Live Erlang widget is to help people to try Erlang with
minimum effort. With the widget web-based Erlang training can be made more
interactive.

# How to use

The first step is to add a div to your webpage that has 'live-erlang' class:

  ...
  <div class="live-erlang"></div>
  ...
  
You can size and style the div the way you want. The add the live-erlang
script right before the end of the document body:

    ...
    <script src="/js/live-erlang.0.1.js"></script>
  </body>
  
This is it.

# How to customize

The widget can use different images for each console. The image type is specified
using the data-image attribute:

  <div class="live-erlang" data-image="standard"></div>
  
The only image type avaiable today is 'standard'. If you need a custom image,
which, for instance, contains specific modules or files, please, contact us at
info@erlangonxen.org.
