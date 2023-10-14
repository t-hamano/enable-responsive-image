=== Enable Responsive Image ===
Contributors: wildworks, Toro_Unit
Tags: gutenberg, block, image, responsive
Requires at least: 6.3
Tested up to: 6.3
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress plugin that adds settings to the Image block to display different images depending on the width of the screen on the front end.

== Description ==

Enable Responsive Image adds settings to the Image block to display different images depending on the width of the screen. You can add multiple images and set media queries and resolution for each image. On the front end side, if the screen width matches the conditions of that media query, it will switch to the corresponding image.

== Installation ==

1. Upload the `enable-responsive-image` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the \'Plugins\' menu in WordPress.

== Frequently Asked Questions ==

= How does this plugin work on the frontend? =

This plugin rewrites the HTML markup for the image block rendered on the front end. Wrap the img element with a picture element, and add source elements with srcset and media attributes inside the picture element based on the settings of the added image.

= What filters can I use? =

You can find a list of the available filters in the [Github readme](https://github.com/t-hamano/enable-responsive-image#filters).

= Even if I switch the screen width or device on the editor, it does not switch to the set image. =

Switching images according to screen width is currently only effective on the front end. Switching on the editor side does not work due to technical or performance issues. It may be supported in the future.

== Screenshots ==

1. Settings added to the block sidebar of the image block
2. How the image changes depending on the screen width

== Resources ==

= Image for screenshot =

* License: Public Domain
* Source: https://openverse.org/ja/image/cd8e5cc5-d38a-462e-b4c1-1ea5c6f94e20

== Changelog ==

= 1.0.0 =
* Initial release
