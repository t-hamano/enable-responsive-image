=== Enable Responsive Image ===
Contributors: wildworks, Toro_Unit
Tags: gutenberg, block, image, responsive
Requires at least: 6.8
Tested up to: 6.9
Stable tag: 1.5.0
Requires PHP: 8.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress plugin that adds settings to the Image block to display different images depending on the width of the screen.

== Description ==

Enable Responsive Image adds settings to the Image block to display different images depending on the width of the screen. You can add multiple images and set media queries and resolution for each image. If the screen width matches the conditions of that media query, it will switch to the corresponding image.

== Installation ==

1. Upload the `enable-responsive-image` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the \'Plugins\' menu in WordPress.

== Frequently Asked Questions ==

= How does this plugin work? =

This plugin rewrites the HTML markup for the image block rendered on the front end. Wrap the img element with a picture element, and add source elements with srcset and media attributes inside the picture element based on the settings of the added image.

= It does not work correctly when multiple image sources are set. =

Try rearranging the order of the images. For example, if both images have a Media Query Type of max-width, the one with the smaller value should be ordered on top.

= Even if I switch the screen width or device on the editor, it does not switch to the set image. =

On the editor side, images do not switch by default. Click the "Enable responsive image preview" button on the block toolbar.

= What filters can I use? =

You can find a list of the available filters in the [Github readme](https://github.com/t-hamano/enable-responsive-image#filters).

== Screenshots ==

1. Settings added to the block sidebar of the image block
2. How the image changes depending on the screen width

== Resources ==

= Image for screenshot =

* License: Public Domain
* Source: https://openverse.org/image/cd8e5cc5-d38a-462e-b4c1-1ea5c6f94e20

== Changelog ==

= 1.5.0 =
* Tested to WordPress 6.9
* Enhancement: Update block toolbar icon
* Drop support for WordPress 6.6 and 6.7
* Drop support for PHP 7

= 1.4.0 =
* Tested to WordPress 6.8
* Enhancement: Show full srcset url
* Accessibility: Respect user preference for CSS transitions
* Drop support for WordPress 6.5

= 1.3.0 =
* Tested to WordPress 6.7
* Drop support for WordPress 6.4

= 1.2.0 =
* Tested to WordPress 6.6

= 1.1.1 =
* Remove unnecessary changelog

= 1.1.0 =
* Tested to WordPress 6.5
* Enhancement: Polish block sidebar

= 1.0.0 =
* Initial release
