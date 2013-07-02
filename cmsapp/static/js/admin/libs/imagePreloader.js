/**
 * An image preloader.
 * @constructor
 * @requires jQuery 1.7 (http://jquery.com)
 */
var ImagePreloader = new Object();

/**
 * preloads images and calls a function when they are complete.
 *
 * @param {Array<string>} preloadArray The array of
 * image paths to preload.
 * @param {Function} returnFunction The function to call when all images
 * are loaded. 
 */
ImagePreloader.preloadImages = function(preloadArray, returnFunction) {
 	var preloadInt = 0;

	for (var i = 0; i < preloadArray.length; i++) {
		var img = new Image();
		img.onload = function() {
			preloadInt++;
			if(preloadInt == preloadArray.length) {
				returnFunction();
			}
		}
		
		img.src = preloadArray[i];	
	}
}