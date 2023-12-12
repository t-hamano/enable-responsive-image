# Enable Responsive Image

[![Test](https://github.com/t-hamano/enable-responsive-image/actions/workflows/run-test.yml/badge.svg)](https://github.com/t-hamano/enable-responsive-image/actions/workflows/run-test.yml)

[![Test and Deploy](https://github.com/t-hamano/enable-responsive-image/actions/workflows/run-test-and-deploy.yml/badge.svg)](https://github.com/t-hamano/enable-responsive-image/actions/workflows/run-test-and-deploy.yml)

WordPress plugin that adds settings to the Image block to display different images depending on the width of the screen.

## Screenshot

![Settings added to the block sidebar of the image block](https://raw.githubusercontent.com/t-hamano/enable-responsive-image/main/.wordpress-org/screenshot-1.png)

![How the image changes depending on the screen width](https://raw.githubusercontent.com/t-hamano/enable-responsive-image/main/.wordpress-org/screenshot-2.gif)

## How to build

```sh
npm install
npm run build
```

## Filters

### `enable_responsive_image_default_media_value( $media_value )`

Filters the default media value (px).

#### Parameters

- `$media_value`

  *(int)* The media value (px). Default is 600.

#### Example

```php
function custom_enable_responsive_image_default_media_value( $media_value ) {
	// Override media value.
	return 400;
}
add_filter( 'enable_responsive_image_default_media_value', 'custom_enable_responsive_image_default_media_value' );
```

## Resources

### Image for screenshot

- License: Public Domain
- Source: <https://openverse.org/image/cd8e5cc5-d38a-462e-b4c1-1ea5c6f94e20>

## Author

[Aki Hamano (Github)](https://github.com/t-hamano)
