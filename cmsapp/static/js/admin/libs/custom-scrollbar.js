/**
 * @fileoverview Creates a custom scrollbar.
 *
 * @requires jQuery (http://jquery.com). 
 * @author mike@mikefey.com	(Mike Fey). 
 */

/**
 * @constructor
 * @param {HTMLElement} dragger The element to be used as the dragger.
 * @param {HTMLElement} track The element to be used as the dragger track.
 * @param {HTMLElement} content The element to be scrolled.
 * @param {Object} contentBounds An object containing the content bounds, in format:
 *    {height: height-in-pixels, width: width-in-pixels}.
 * @param {Object} contentOffset An object containing the the offset of the content, in format:
*    {x: offset-from-left-in-pixels, width: offset-from-right-in-pixels}.
 */
function CustomScrollbar(dragger, track, content, contentBounds, contentOffset) {
  var instance = this;
  
  this.scrollTimer = 0;
  this.bounds = contentBounds;
  this.offset = contentOffset;
	this.timerRunning = true;
	this.dragging = false;
	this.dragEnabled = false;
  
  /**
   * Sets a new object for the bounds.
   *
   * @param {Object} contentBounds An object containing the content bounds, in format:
   *    {height: height-in-pixels, width: width-in-pixels}.
   */
  this.setBounds = function(boundsObject) {
    instance.bounds = boundsObject;
  }

	/**
   * Sets a new object for the offset.
   *
   * @param {Object} offsetObject An object containing the offset parameters, in format:
   *    {x: left-offset-in-pixels, y: top-offset-in-pixels, height: height-offset-in-pixels}.
   */
  this.setOffset = function(offsetObject) {
    instance.offset = offsetObject;
  }

	/**
   * Sets the containment parameters for the content dragging.
   *
   * @param {Array} containmentBounds [x1, y1, x2, y2].
   */
  this.setContentDraggableContainment = function(containmentBounds) {
    $(content).draggable({
	 		containment : containmentBounds
		});
  }
  
  /**
   * Destroys the scroller, removes everything from memory.
   *
   */
  this.disable = function() {
		instance.timerRunning = false;
    window.clearInterval(instance.scrollTimer);
    $(window).unbind('mousewheel', instance.moveDragger);
  }
  
  /**
   * Destroys the scroller, removes everything from memory.
   *
   */
  this.enable = function() {
		instance.timerRunning = true;
    instance.scrollTimer = window.setInterval(instance.scrollContent, 15);
		if (instance.dragEnabled == false) {
			$(window).bind('mousewheel', instance.moveDragger); 
		}
  }
  
  /**
   * Destroys the scroller, removes everything from memory.
   *
   */
  this.destroy = function() {
    $(window).unbind('mousewheel', instance.moveDragger);
    $(dragger).unbind();
    $(track).unbind();
		instance.timerRunning = false;
    window.clearInterval(instance.scrollTimer);
  }

	/**
   * Destroys the scroller, removes everything from memory.
   *
   */
  this.enableDrag = function() {
		instance.dragEnabled = true;
		$(content).draggable({
			axis: 'y',
		 
		  start: function() {
				instance.disable();
				instance.dragging = true; 
			},
			
			drag: function() {
				var percScrolled = (((Number($(content).css('top').replace(/[^-\d\.]/g, ''))) - instance.offset.y) / (($(content).height() + instance.offset.y + instance.offset.height) - instance.bounds.height) - .01) * -1;
				percScrolled = Cykel.utils.roundNumber(percScrolled, 2);
				if (percScrolled <= .01) {
					percScrolled = 0;
				}
				
				$(dragger).css({'top' : (percScrolled * (instance.bounds.height - $(dragger).height())) + 'px'});
			},
			
		  stop: function() {
				setTimeout(function(){instance.dragging = false}, 100);
			}
		
		});
  }
  
  /**
   * Moves the dragger.
   *
   * @param {Event} e A mouse event.
   * @param {Number} delta The amount the mouse wheel was scrolled.
   * @param {Number} deltaX The  horizontal amount the mouse wheel was scrolled.
   * @param {Number} deltaY The vertical amount the mouse wheel was scrolled.
   */
  this.moveDragger = function(e, delta, deltaX, deltaY) {
    var curMarginTop = Number($(dragger).css('top').replace(/[^-\d\.]/g, ''));
    var newPos = curMarginTop + (-deltaY * 30);
    if (newPos < 0) {
      newPos = 0;
    }
     
    if (newPos > instance.bounds.height - $(dragger).height()) {
      newPos = instance.bounds.height - $(dragger).height();
    }
    
    $(dragger).css({'top' : newPos + 'px'});
    
    e.preventDefault();
    
    return false;
  }
  
  /**
   * Moves the content.
   *
   * @private
   */ 
  this.scrollContent = function() {
		if (instance.dragging == false) {
			var dPos = Number($(dragger).css('top').replace(/[^-\d\.]/g, ''));
	    var scrollable = ($(content).height() - (instance.bounds.height - contentOffset.y));
			if (instance.offset.height) {
				scrollable = (($(content).height() + instance.offset.height) - (instance.bounds.height - contentOffset.y));
			}
	    var percScrolled = dPos/($(track).height() - $(dragger).height());

	    $(content).css({'top' : (-(percScrolled * scrollable) + instance.offset.y) + 'px'});
		}
  }
  
  $(dragger).draggable({
    containment : $(track),
		start:function() {
			if (instance.dragEnabled == true && instance.timerRunning == false) {
				instance.enable();
			}
		}
  });
  
}