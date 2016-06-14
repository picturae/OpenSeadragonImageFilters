(function ($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonImagefilters requires OpenSeadragon version 2.0.0+');
    }

    //@todo add check for imagefiltersplugin

    $.Viewer.prototype.imagefilters = function (options) {
        if (!this.imageFilters || options) {
            options = options || {};
            options.viewer = this;
            this.imageFilters = new $.ImagefilterTools(options);
        }
        return this.imageFilterInstance;
    };


    /**
     * @class ImagefilterTools
     * @classdesc Provides functionality for displaing imagefilters as rangesliders
     * @memberof OpenSeadragon
     * @param {Object} options
     */
    $.ImagefilterTools = function (options) {
        $.extend(true, this, {
            // internal state properties
            viewer: null,
            buttonActiveImg: false,

            // options
            showControl: true,
            startOpen: true,
            element: null,
            toggleButton: null,
            prefixUrl: null,
            toolsWidth: 180,
            toolsHeight: 200,
            class: null,
            navImages: {
                imagetools: {
                    REST: 'selection_rest.png',
                    GROUP: 'selection_grouphover.png',
                    HOVER: 'selection_hover.png',
                    DOWN: 'selection_pressed.png'
                }
            },
            filters: {
                brightness: {
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = $.getElement('osd-filter-brightness').value;
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.brightness(parseInt(setTo));
                                this.render(callback);
                            });
                        };
                    }
                },
                contrast:{
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = $.getElement('osd-filter-contrast').value;
                        console.log(setTo);
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.contrast(parseInt(setTo));
                                this.render(callback);
                            });
                        };
                    }
                },
                saturation:{
                    min: -100,
                    max: 100,
                    processor: function() {
                        var setTo = $.getElement('osd-filter-saturation').value;
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.saturation(parseInt(setTo));
                                this.render(callback);
                            });
                        };
                    }
                },
                hue: {
                    min: 0,
                    max: 100,
                    processor: function() {
                        var setTo = $.getElement('osd-filter-hue').value;
                        return function (context, callback) {
                            Caman(context.canvas, function () {
                                this.hue(parseInt(setTo));
                                this.render(callback);
                            });
                        };
                    }
                }
            }
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

        //should disbale caman cache to prevent memory leak
        Caman.Store.put = function() {};

    };

    $.extend($.ImagefilterTools.prototype, $.ControlDock.prototype, /** @lends OpenSeadragon.Selection.prototype */{

        openTools: function () {

            //check if tools popup exists and if not create based on filters
            var popup = $.getElement('osd-imagetools');
            if (!popup) {
                var rect = this.toggleButton.element.getBoundingClientRect();
                var width = this.toolsWidth;
                var height = this.toolsHeight;

                var popupTop = rect.top - height - 10;
                var popupLeft = (rect.left + (rect.width / 2)) - (width / 2);

                //if popup is outside view render it below
                if (popupTop < 0) {
                    popupTop = rect.bottom + 10;
                }

                popup = new Element('div');
                popup.id = 'osd-imagetools';
                if(this.class){
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

                document.body.appendChild(popup);

                for (var f in this.filters) {

                    var filter = this.filters[f];

                    //new input element
                    var filterElement = new Element('input');
                    filterElement.type = "range";
                    filterElement.min = filter.min;
                    filterElement.max = filter.max;
                    filterElement.step = filter.step || 1;
                    filterElement.value = filter.value || 0;
                    filterElement.id = "osd-filter-" + f;
                    filterElement.functionName = f;

                    //add event to slider
                    this.onRangeChange(filterElement);
                    //add to tools popup with label
                    var label = new Element('p');
                    label.style = "margin:0;";
                    label.innerHTML = $.getString('Tool.' + f) || f;

                    popup.appendChild(label);
                    popup.appendChild(filterElement);
                }

                //add reset button
                var resetButton = new Element('button');
                resetButton.innerHTML = $.getString('Tool.reset') || 'reset';
                resetButton.style = "display:block; margin: 0 auto; padding: 2px;";

                //add functionality to reset button
                resetButton.addEventListener('click', function () {this.resetFilters()}.bind(this));
                popup.appendChild(resetButton);
            }

            toggleVisablity(popup);
        },

        updateFilters: function () {
            var filters = [];

            for (var f in this.filters) {
                 filters.push(this.filters[f].processor());
            }

            this.viewer.setFilterOptions({
                filters: {
                    processors: filters
                },
                loadMode: 'async'
            });
        },

        resetFilters: function () {
            for (var f in this.filters) {
                var filterInput = $.getElement("osd-filter-" + f);
                filterInput.value = this.filters[f].value || 0;
            }
            this.updateFilters();
        },

        /**
         * Copied from http://stackoverflow.com/questions/18544890/onchange-event-on-input-type-range-is-not-triggering-in-firefox-while-dragging/37623959#37623959
         * @param rangeInputElmt
         * @param listener
         */
        onRangeChange: function (rangeInputElmt, callback) {

            var inputEvtHasNeverFired = true;
            var rangeValue = {current: undefined, mostRecent: undefined};

            var functionName = rangeInputElmt.functionName;

            rangeInputElmt.addEventListener("input", function (evt) {
                inputEvtHasNeverFired = false;
                rangeValue.current = evt.target.value;
                if (rangeValue.current !== rangeValue.mostRecent) {
                    this.updateFilters();
                }
                rangeValue.mostRecent = rangeValue.current;
            }.bind(this));

            rangeInputElmt.addEventListener("change", function (evt) {
                if (inputEvtHasNeverFired) {
                    this.updateFilters();
                 }
            }.bind(this));
        }
    });

    function toggleVisablity(element) {
        var isShown = element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display;
        if (isShown != 'none') {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }


})(OpenSeadragon);

//# sourceMappingURL=openseadragonimagefilter.js.map
