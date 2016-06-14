# OpenSeadragonImageFilters

Adds a control to OpenSeadragon that enables the user to change the image via sliders based on provided filters.
Default are; brightness, contrast, saturation and hue.


Usage:
Include dist/openseadragonimagefilter-vendor.js after openseadragon-filtering.js (avaialable here: https://github.com/usnistgov/OpenSeadragonFiltering)
Include dist/openseadragonimagefilter.js after openseadragonimagefilter-vendor.js

Then init controls like so:

viewer.imagefilters(options);

options:
* todo add options if they are final


Depends on:
* rangeslider (https://github.com/andreruffert/rangeslider.js)
* openseadragon-filtering.js (https://github.com/usnistgov/OpenSeadragonFiltering)
* openseadragon.js (http://openseadragon.github.io/)

