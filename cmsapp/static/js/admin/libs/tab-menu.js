define(function() {

	/* @requires jQuery */

	/**
	 * Creates a new tab menu.
	 *
	 * @param {Array} dataObjectArray The array of objects 
	 * 		that hold the button DOM elements and their corresponding 
	 * 		functions, in this format:
	 * 		dataObjectArray = [
	 *			{
	 *				button: $(domElement),
	 *				function: doSomething
	 *			},
	 *			{
	 *				button: $(domElement2),
	 *				function: doSomething2
	 *			}
	 *		]
	 * @param {String} selectedClass The name of the class
	 * to add or remove
	 */
	function TabMenu(dataObjectArray, selectedClass) {
		var instance = this;
		this.dataObjectArray = dataObjectArray;
		this.selectedClass = selectedClass;

		function init() {
			for (var i = 0; i < instance.dataObjectArray.length; i++) {
				instance.dataObjectArray[i].button.data('function', instance.dataObjectArray[i].function);
				instance.dataObjectArray[i].button.data('iteration', i);
				instance.dataObjectArray[i].button.bind('click', function() {
					if (!$(this).hasClass(instance.selectedClass)) {
						var clickFunction = $(this).data('function');
						clickFunction($(this).data('iteration'));

						instance.selectOption($(this).data('iteration'));
					}
				});
			}
		}

		init();

	};

	TabMenu.prototype.selectOption = function(currentIteration) {
		for (var i = 0; i < this.dataObjectArray.length; i++) {
			if (i == currentIteration) {
				this.dataObjectArray[i].button.addClass(this.selectedClass);
			} else {
				this.dataObjectArray[i].button.removeClass(this.selectedClass);
			}
		}
	};

	return {
		TabMenu: TabMenu
	}

});