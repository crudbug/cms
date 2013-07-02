(function( $ ){
  
  /**********************************
  methods
  **********************************/ 
  var methods = {
    init : function( options ){
	
			var defaults = {
				containerDiv : 'container',
				scrollDiv : 'scrollDiv',
				direction : 'vertical',
				scrollHitSize : 30,
				offset:0,
				initMouseXPos : 0,
				initMouseYPos : 0
			}
			
			var options = $.extend(defaults, options);
			var containerDiv = $('#' + options.containerDiv);
			var scrollDiv = $('#' + options.scrollDiv);
			var moveTimer = 0;
			var curMouseX = 0;
			var curMouseY = 0;
			var containerHeight = containerDiv.height();
			var containerWidth = containerDiv.width();
			var scrollPercentage = 0;
			var moveDirection = 'down';
			var scrollSpeed = 0;
			var scrollHitSize = options.scrollHitSize;
			var offset = options.offset;
			var menuBack;
			var isMobile = jQuery.browser.mobile;
			
			return this.each(function(){
				
				scrollDiv.css({'position' : 'absolute'});
				containerDiv.bind('mouseenter', onContainerOver);
				containerDiv.bind('mouseleave', onContainerOut);
				containerDiv.mousemove(getScrollPosition);
				
				if(options.initMouseXPos >= containerDiv.offset().left && options.initMouseXPos < (containerDiv.offset().left + containerDiv.width()) &&
				    options.initMouseYPos >= containerDiv.offset().top && options.initMouseYPos < (containerDiv.offset().top + containerDiv.height())) {
				  if(options.direction == 'vertical'){
				    if (scrollDiv.height() > containerDiv.height()) {
				      startMoving();
				    }
			    }
			    
			    if(options.direction == 'horizontal'){
				    if (scrollDiv.width() > containerDiv.width()) {
				      startMoving();
				    }
			    }
				}
				
			});
			
			function onContainerOver(e) {
				startMoving();
			}
			
			function onContainerOut(e) {
				stopMoving();
			}
			
			function startMoving(){
			  clearInterval(moveTimer);
				moveTimer = setInterval(moveScrollDiv, 13);
			}
			
			function stopMoving(){
				clearInterval(moveTimer);
			}
			
			function getScrollPosition(e){
				curMouseX = e.pageX - $(this).offset().left;
				curMouseY = e.pageY - $(this).offset().top;
			}
			
			function moveScrollDiv() {
				if(options.direction == 'vertical'){
				  containerHeight = containerDiv.height();
					scrollPercentage = Math.round((curMouseY / containerHeight) * 100);
					var cmt = scrollDiv.css('margin-top');
					cmt = Number(cmt.substr(0, cmt.length - 2));
					
					if(scrollPercentage >= 0 && scrollPercentage <= scrollHitSize){
						 moveDirection = 'down';
						 scrollSpeed = Math.round( (scrollHitSize - scrollPercentage) / 5 );
					}else if(scrollPercentage >= (100 - scrollHitSize) && scrollPercentage <= 100){
						 moveDirection = 'up';
						 scrollSpeed = Math.round( (scrollHitSize - (100 - scrollPercentage)) / 5 ); 
					}else{
						scrollSpeed = 0;
					}
					
					if(moveDirection == 'up') {
						cmt = cmt - scrollSpeed; 
					}
					
					if(moveDirection == 'down') {
						cmt = cmt + scrollSpeed;
					}
					
					if(cmt < (containerHeight - offset) - scrollDiv.height()){
						cmt = (containerHeight - offset) - scrollDiv.height();
					}
					
					if(cmt > 0){
						cmt = 0;
					}
					
					scrollDiv.css({'margin-top' : cmt + 'px'});
					
				} else if(options.direction == 'horizontal'){
				  
				  containerWidth = containerDiv.width();
				  scrollPercentage = Math.round((curMouseX / containerWidth) * 100);
				  var movePrefix = '+=';

					if(scrollPercentage >= 0 && scrollPercentage <= scrollHitSize){
						 moveDirection = 'left';
						 scrollSpeed = Math.round( (scrollHitSize - scrollPercentage) / 5 );
					}else if(scrollPercentage >= (100 - scrollHitSize) && scrollPercentage <= 100){
						 moveDirection = 'right';
						 scrollSpeed = Math.round( (scrollHitSize - (100 - scrollPercentage)) / 5 ); 
						 movePrefix = '-=';
					}else{
						scrollSpeed = 0;
					}
					
					scrollDiv.stop(true, true).animate({
             marginLeft: movePrefix + scrollSpeed
          },
          {
            duration: 100,
            specialEasing: {
              opacity: 'linear'
            }
          });
          
					if(scrollDiv.offset().left - options.offset < (containerWidth - scrollDiv.width() + 9)){
						scrollSpeed = 0;
						scrollDiv.stop(true, true).css({'margin-left' : ((containerWidth - scrollDiv.width()) + 9) + 'px'});
					}
					
					if(scrollDiv.offset().left - options.offset > 0){
						scrollSpeed = 0;
						scrollDiv.stop(true, true).css({'margin-left' : '0px'});
					}
					
			  }
			}
		},
		
		destroy : function() {
		  $(this).unbind();
		}
	}
	
	/**********************************
  	controller
    **********************************/
  	$.fn.mouseMoveMenu = function( method ) {
        if ( methods[method] ) {
    		return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    	} else if ( typeof method === 'object' || ! method ) {
    		return methods.init.apply( this, arguments );
    	} else {
      		$.error( 'Method ' +  method + ' does not exist on jQuery.mouseMoveMenu' );
    	}
  	};

})( jQuery );