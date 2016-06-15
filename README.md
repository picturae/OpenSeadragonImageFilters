# OpenSeadragonImageFilters

Adds a control to OpenSeadragon that enables the user to change the image via sliders based on provided filters.
Default are; brightness, contrast, saturation and hue.


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
            toolsHeight: 200, //int width in pixels
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
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = getElementValueAsInt('osd-filter-brightness');
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.brightness(setTo);
                                this.render(callback);
                            });
                        };
                    }
                },
                contrast:{
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = getElementValueAsInt('osd-filter-contrast');
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.contrast(setTo);
                                this.render(callback);
                            });
                        };
                    }
                },
                saturation:{
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = getElementValueAsInt('osd-filter-saturation');
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.saturation(setTo);
                                this.render(callback);
                            });
                        };
                    }
                },
                hue: {
                    min: 0,
                    max: 100,
                    processor: function() {
                        var setTo = getElementValueAsInt('osd-filter-hue');
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.hue(setTo);
                                this.render(callback);
                            });
                        };
                    }
                }
            }
```
### Depends on:
* openseadragon-filtering.js (https://github.com/usnistgov/OpenSeadragonFiltering)
* openseadragon.js (http://openseadragon.github.io/)

### Development notes
* Checkout this project
* Install bower dependencies via bower install (currently no dependencies)
* Install npm dev dependencies via npm install
* Edit code in /src
* Use gulp watch to watch for changes and compile js in /dist
