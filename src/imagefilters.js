(function($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonImagefilters requires OpenSeadragon version 2.0.0+');
    }

    $.Viewer.prototype.imagefilters = function(options) {
        if (!this.imageFilters || options) {
            options = options || {};
            options.viewer = this;
            this.imageFilters = new $.ImagefilterControls(options);
        }
        return this.selectionInstance;
    };


    /**
    * @class ImagefilterControlls
    * @classdesc Provides functionality for displaing imagefilters as rangesliders
    * @memberof OpenSeadragon
    * @param {Object} options
    */
    $.ImagefilterControls = function ( options ) {

    };

   

})(OpenSeadragon);
