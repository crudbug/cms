define(['jquery',
	'jquery-jscrollpane',
	'jquery-fileupload-ui',
	'jquery-simplemodal'
	
	], function() {
		
		var cropWindowWidth = 200;
		var cropWindowHeight = 133;
		var hideCropThumbnailMessageTimeout = 0;
		
		var modalSettings = {
		  overlayClose:true,
		  minWidth:600,
		  minHeight:400
		};

		/**
		 * Opens the thumbnail edit modal window.
		 *
		 * @param {Event} e A mouse event.
		 */
		function openCustomThumbModal(e) { 
			uploadCompleteInt = 0;
		  	$('#custom_thumbnail').modal(modalSettings);
		
			$('#custom_thumbnail_btn').unbind();
			$('#custom_thumbnail_btn').bind('click', createCustomThumbnail);
			
		  return false;
		}

		/**
		 * Sets up thumbnail editing.
		 */
		function initThumbEdit() {
			if($('#custom_thumbnail_preview_image_inner').find('img').length > 0) {
				$('#custom_thumbnail_preview_image_inner').find('img').unbind();
			}
			
			$('#custom_thumbnail_preview_image_inner').html(''); 
			
			var img = new Image();
			$('#custom_thumbnail_preview_image_inner').append($(img));
			
			$(img).load(function() {
		    
		  	}).error(function() {

		  	}).attr('src', $('#editing_image_container').find('img').eq(0).attr('src')); 
		
			var viewportContentWidth = Number($('#editing_image_container').find('img').eq(0).attr('width')) * .3333;
			var viewportContentHeight = Number($('#editing_image_container').find('img').eq(0).attr('height')) * .3333;
		
		  	$('#custom_thumbnail_preview_image_inner').find('img').eq(0).jrac({
        		'crop_width': cropWindowWidth,
        		'crop_height': cropWindowHeight,
        		'crop_x': (viewportContentWidth / 2) - (cropWindowWidth / 2),
        		'crop_y': (viewportContentHeight / 2) - (cropWindowHeight / 2),
        		'viewport_width': 309,
				'viewport_height': 220,
				'image_width' : viewportContentWidth,
				'image_height' : viewportContentHeight,
				'viewport_content_left': 155 - (viewportContentWidth / 2),
	      		'viewport_content_top': 110 - (viewportContentHeight / 2),
				'viewport_resize': false,
				'crop_resize' : false,
        		'viewport_onload': function() {
	          		var $viewport = this;
	          		var inputs = $('#custom_thumbnail_info input:text');
	          		var events = ['jrac_crop_x','jrac_crop_y','jrac_image_width','jrac_image_height'];
	          		for (var i = 0; i < events.length; i++) {
		            var event_name = events[i];
		            // Register an event with an element.
		            $viewport.observator.register(event_name, inputs.eq(i));
		            // Attach a handler to that event for the element.
		            inputs.eq(i).bind(event_name, function(event, $viewport, value) {
						$(this).val(value);
		            })
		            // Attach a handler for the built-in jQuery change event, handler
		            // which read user input and apply it to relevent viewport object.
		            .change(event_name, function(event) {
		              	var event_name = event.data;
		              	$viewport.$image.scale_proportion_locked = $('#custom_thumbnail_info input:checkbox').is(':checked');
		              	$viewport.observator.set_property(event_name,$(this).val());
		            });
		        }

	          	$viewport.$container.append('<div id="thumbnail_crop_size_display"><strong>Original image size:</strong> ' + 
	          		$viewport.$image.originalWidth + ' x ' + 
	            	$viewport.$image.originalHeight + '</div>')
	        	}
      		})

      		// React on all viewport events.
      		.bind('jrac_events', function(event, $viewport) {
        		var inputs = $('#custom_thumbnail_info input');
        		inputs.css('background-color',($viewport.observator.crop_consistent())?'#fff':'#F04C34');
      		});
		} 
		
		function createCustomThumbnail() {
			var dataObj = {}
			dataObj.filepath = $('#editing_image_container').find('img').eq(0).attr('src');
			dataObj.filewidth = Math.round(Number($('#thumb_image_width').val()));
			dataObj.fileheight = Math.round(Number($('#thumb_image_height').val()));
			dataObj.filetop = Math.round(Number($('#thumb_image_crop_y').val()));
			dataObj.fileleft = Math.round(Number($('#thumb_image_crop_x').val()));
			dataObj.fileoriginalwidth = Math.round(Number($('#editing_image_container').find('img').eq(0).attr('width')));
			dataObj.fileoriginalheight = Math.round(Number($('#editing_image_container').find('img').eq(0).attr('height')));
			
			$.ajax({
        		type: 'POST',
        		url: '/admin/media/crop',
        		data: dataObj,
        		success: function(data) {
        			showThumbnailSuccessMessage();
       			}
      		});
			
			return false;
		}
		
		function showThumbnailSuccessMessage() {
			clearTimeout(hideCropThumbnailMessageTimeout);
			
			$('#custom_thumbnail').find('.uu_success').stop(true, true).show().css({opacity : 0.0});
			$('#custom_thumbnail').find('.uu_success').stop(true, true).animate({
		      opacity: 1.0
		    },
		    {
				duration: 300,
		    	specialEasing: {
		        	opacity: 'easeOutExpo'
		      	}
		    });
		
			hideCropThumbnailMessageTimeout = setTimeout(hideThumbnailSuccessMessage, 5000);
		}
		
		function hideThumbnailSuccessMessage() {
			$('#custom_thumbnail').find('.uu_success').stop(true, true).animate({
	      		opacity: 'hide'
	    	},
	    	{
				duration: 300,
	      		specialEasing: {
	        		opacity: 'easeOutSine'
	      		}
	    	});
		}

		return {
			openCustomThumbModal : openCustomThumbModal,
			initThumbEdit: initThumbEdit
		}
	
});