(function ($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonImagefilters requires OpenSeadragon version 2.0.0+');
    }

    //should disable caman cache to prevent memory leak
    var caman = Caman;
    caman.Store.put = function () {
    };

    $.Viewer.prototype.imagefilters = function (options) {
        if (!this.imageFilterInstance || options) {
            options = options || {};
            options.viewer = this;
            this.imageFilterInstance = new $.ImagefilterTools(options);
        }
        return this.imageFilterInstance;
    };

    /**
     * @class ImagefilterTools
     * @classdesc Provides functionality for displaying imagefilters as rangesliders
     * @memberof OpenSeadragon
     * @param {Object} options
     */
    $.ImagefilterTools = function (options) {
        $.extend(true, this, {
            // internal state properties
            viewer: null,
            buttonActiveImg: false,

            // options
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
                    processor: function () {
                        var setTo = getElementValueAsFloat('osd-filter-brightness');
                        return OpenSeadragon.Filters.BRIGHTNESS(
                            setTo
                        );
                    }
                },
                contrast: {
                    min: 0,
                    max: 5,
                    value: 1,
                    step: 0.1,
                    processor: function () {
                        var setTo = getElementValueAsFloat('osd-filter-contrast');
                        console.log(setTo);
                        return OpenSeadragon.Filters.CONTRAST(
                            setTo
                        );
                    }
                },
                //Left below in code as example
                // saturation requires caman and caman requires reload of tiles. (see sync option)
                // saturation:{
                //     min: -100,
                //     max: 100,
                //     sync: false,
                //     processor: function() {
                //         var setTo = getElementValueAsFloat('osd-filter-saturation');
                //         this.current = setTo;
                //         return function (context, callback) {
                //             caman(context.canvas, function () {
                //                 this.saturation(setTo);
                //                 this.render(callback);
                //             });
                //             this.current = setTo;
                //         };
                //     }
                // },
                // hue: {
                //     min: 0,
                //     max: 100,
                //     sync: false,
                //     processor: function() {
                //         var setTo = getElementValueAsFloat('osd-filter-hue');
                //         return function (context, callback) {
                //             caman(context.canvas, function () {
                //                 console.log('hue: '+ setTo);
                //                 this.hue(setTo);
                //                 this.render(callback);
                //             });
                //         };
                //     }
                // }
            },
            element: null,
            toggleButton: null
        }, options);

        $.extend(true, this.navImages, this.viewer.navImages);

        var prefix = this.prefixUrl || this.viewer.prefixUrl || '';
        var useGroup = this.viewer.buttons && this.viewer.buttons.buttons;

        if (this.showControl) {
            this.toggleButton = new $.Button({
                element: this.toggleButton ? $.getElement(this.toggleButton) : null,
                clickTimeThreshold: this.viewer.clickTimeThreshold,
                clickDistThreshold: this.viewer.clickDistThreshold,
                tooltip: $.getString('Tooltips.ImageTools') || 'Image tools',
                srcRest: prefix + this.navImages.imagetools.REST,
                srcGroup: prefix + this.navImages.imagetools.GROUP,
                srcHover: prefix + this.navImages.imagetools.HOVER,
                srcDown: prefix + this.navImages.imagetools.DOWN,
                onRelease: this.openTools.bind(this)
            });

            if (useGroup) { //what does this do?
                this.viewer.buttons.buttons.push(this.toggleButton);
                this.viewer.buttons.element.appendChild(this.toggleButton.element);
            }
            if (this.toggleButton.imgDown) { //what does this do?
                this.buttonActiveImg = this.toggleButton.imgDown.cloneNode(true);
                this.toggleButton.element.appendChild(this.buttonActiveImg);
            }
        }

        this.viewer.addHandler('open', function () {
            this.createPopupDiv();
        }.bind(this));

        if (this.startOpen) {
            this.viewer.addHandler('open', function () {
                this.openTools();
            }.bind(this));
        }
    };

    $.extend($.ImagefilterTools.prototype, $.ControlDock.prototype, /** @lends OpenSeadragon.ImagefilterTools.prototype */{

        /*
        Add popup div to viewer, and add range input elements per filter
         */
        createPopupDiv: function () {
            //check if tools popup exists and if not create based on filters
            var popup = $.getElement('osd-imagetools');
            if (!popup) {

                //alway render toolpopup center LEFT
                var width = this.toolsWidth;
                var height = this.toolsHeight;

                var v = $.getElement(this.viewer.id);
                var viewerPosition = v.getBoundingClientRect();

                var popupTop = (viewerPosition.height / 2) - (height / 2);
                var popupLeft = 10;

                popup = document.createElement('div');
                popup.id = 'osd-imagetools';
                if (this.class) {
                    popup.class = this.class;
                } else {
                    popup.style = "display: none; text-align:center; position:absolute;" +
                        "border: 1px solid black; " +
                        "background-color: white; " +
                        "width: " + width + "px; " +
                        "height: " + height + "px; " +
                        "top: " + popupTop + "px; " +
                        "left: " + popupLeft + "px;";
                }

                //add to controlls, needed for fullscreen
                this.viewer.addControl(popup, {});
                popup.style.display = 'none'; //add Controll sets display:block

                //add range input for all filters
                for (var f in this.filters) {
                    var filter = this.filters[f];

                    //new input element
                    var filterElement = document.createElement('input');
                    filterElement.type = "range";
                    filterElement.min = filter.min;
                    filterElement.max = filter.max;
                    filterElement.step = filter.step || 1;
                    filterElement.value = filter.value || 0;
                    filterElement.id = "osd-filter-" + f;

                    //add event to slider
                    this.onRangeChange(filterElement);
                    //add to tools popup with label
                    var label = document.createElement('p');
                    label.style = "margin:0;";
                    label.innerHTML = $.getString('Tool.' + f) || f;

                    popup.appendChild(label);
                    popup.appendChild(filterElement);
                }

                //add reset button
                var resetButton = document.createElement('button');
                resetButton.innerHTML = $.getString('Tool.reset') || 'reset';
                resetButton.style = "display:block; margin: 0 auto; padding: 2px;";

                //add functionality to reset button
                resetButton.addEventListener('click', function () {
                    this.resetFilters();
                }.bind(this));
                popup.appendChild(resetButton);
            }
        },

        /**
         * Open the tools popup
         */
        openTools: function () {
            var popup = $.getElement('osd-imagetools');
            toggleVisablity(popup);
        },

        /**
         * Update filters via debounce so input events don't fire to soon after each other
         */
        updateFilters: _.debounce(updateFilters, 50),

        /**
         * Resets filters by setting range inputs to default value
         */
        resetFilters: function () {
            for (var f in this.filters) {
                var filterInput = $.getElement("osd-filter-" + f);
                filterInput.value = this.filters[f].value || 0;
            }
            this.updateFilters();
        },

        /**
         * Add update event to element
         * @param rangeInputElmt
         * @param listener
         */
        onRangeChange: function (rangeInputElmt, callback) {
            rangeInputElmt.addEventListener("input", function (evt) {
                console.log('input');
                this.updateFilters();
            }.bind(this));
        }
    });

    /**
     * Toggle element display property
     * @param element
     */
    function toggleVisablity(element) {
        var isShown = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        if (isShown != 'none') {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }

    /**
     * get Element value as Float
     * @param element
     * @returns {Number}
     */
    function getElementValueAsFloat(element) {
        return parseFloat($.getElement(element).value);
    }

    /**
     * Updates filters of viewers
     */
    function updateFilters() {
        console.log('update!');
        var filters = [];

        var sync = true;
        for (var f in this.filters) {
            filters.push(this.filters[f].processor());
            if (this.filters[f].sync === false) {
                sync = false;
            }
        }

        this.viewer.setFilterOptions({
            filters: {
                processors: filters
            },
            loadMode: sync ? 'sync' : 'async'
        });
    }

})(OpenSeadragon);
