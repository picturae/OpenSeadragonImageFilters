# OpenSeadragonImageFilters

Adds a control to OpenSeadragon that enables the user to change the image via sliders based on provided filters.
Default are; brightness, contrast, saturation and hue.

### Demo
http://picturae.github.io/openseadragonselection/

### Usage:
Include dist/openseadragonimagefilter.js after openseadragon
add images for button in your open seadragon images folder or provide in options (not tested)

Then init controls like so (where viewer is your OpenSeadragon Instance):

viewer.imagefilters(options);

### options:
```json
    showControl: true, //show button or not
    startOpen: false, //start viewer with ImageFilterTools open
    prefixUrl: null, //alternative location of images
    toolsLeft: null, //int for absolute positioning
    toolsTop: null, //int for absolute positioning
    toolsWidth: 180, //int width in pixels
    toolsHeight: 150, //int height in pixels
    class: null, //override standard styling, NB. you need to style everything
    navImages: { //images to use
        imagetools: {
            REST: 'imagetools_rest.png',
            GROUP: 'imagetools_grouphover.png',
            HOVER: 'imagetools_hover.png',
            DOWN: 'imagetools_pressed.png'
        }
    },
    filters: { //add filters here
        brightness: {
            min: -255,
            max: 255,
            callback: null,
            processor: function () {
                var setTo = getElementValueAsFloat('osd-filter-brightness');
                if (this.callback !== null) {
                    this.callback(setTo);
                }
                return OpenSeadragon.Filters.BRIGHTNESS(setTo);
            }
        },
        contrast: {
            min: 0,
            max: 5,
            value: 1,
            default_value: 1,
            step: 0.1,
            callback: null,
            processor: function () {
                var setTo = getElementValueAsFloat('osd-filter-contrast');
                if (this.callback !== null) {
                    this.callback(setTo);
                }
                return OpenSeadragon.Filters.CONTRAST(setTo);
            }
        }
    }
```
### Depends on:
* openseadragon-filtering.js (https://github.com/usnistgov/OpenSeadragonFiltering)
* openseadragon.js (http://openseadragon.github.io/)

### Development notes:
* Checkout this project
* Install bower dependencies via bower install (currently depends on caman)
* Install npm dev dependencies via npm install
* Edit code in /src
* Use gulp watch to watch for changes and compile js in /dist
* All depenencies except Openseadragon are compiled into one file dist/openseadragonimagefilter.js using gulp
