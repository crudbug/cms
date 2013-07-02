define([
	'text!edit-page-template.html',
	'tab-menu',
	'admin-images',
	'jquery-te-1.3.3'],
	
	function(editPageTemplateText, tabMenu) {

		var spinnerSettings = {
			lines: 12,
			length: 7,
			width: 2,
			radius: 7,
			color: '#000',
			speed: 2,
			trail: 60,
			shadow: false
		};
		
		var modalSettings2 = {
		  	overlayClose:true,
		  	minWidth:960,
		  	minHeight:600
		};
		
		var scrollPaneSettings = {
		  	autoReinitialise: true
		};
		
		var adminImages;
		require(['admin-images'], function(adminImagesInstance) {
			adminImages = adminImagesInstance;
		});
		
		var editPageTemplate = Handlebars.compile(editPageTemplateText);

		var customFieldBlockHtml = '<li class="custom_field_block">' +
			'<div class="custom_field_column">' +
		    '<div class="custom_field_title">Title</div>' +
		    '<input class="edit_input" name="custom_field_title" value="">' +	
		    '</div>' +
		    '<div class="custom_field_column_right">' +
		    '<div class="custom_field_title">Value</div>' +
		    '<input class="edit_input" name="custom_field_value" value="">' +	
		    '</div>' +
		    '<div class="custom_field_column_right">' +
		    '<div class="custom_field_title">Value 2</div>' +
		    '<input class="edit_input" name="custom_field_value_2" value="">' +	
		    '</div>' +
		    '<input type="hidden" name="custom_field_id" value="new">' +
		    '<input class="custom_field_delete_input" type="hidden" name="custom_field_delete" value="false">' +
		    '<div class="custom_field_delete_btn">×</div>' +
		    '</li>';

		var contentBlockArray = [
			$('#page_image_block'),
	  		$('#update_page_inputs'),
	  		$('#update_product_info_inputs')
	  	];

	  	var showCurrentContentBlockTimeout = 0;

	  	var formAction = $('#update_page_form form').attr('action');
		
		function init() {
	 		$('#page_description_input').jqte();

			$('#add_media_button a').bind('click', addMediaButtonClick);
			$('#custom_field_add_btn').bind('click', addCustomFieldBlock);
				
			sizeGalleryImageContainer();
				
			if($('#page_media_images').length > 0) {

				$('#page_media_images').disableSelection();

				var curUrl = window.location.href;
				var urlArray = String(curUrl).split('/');
				var curGalId = urlArray[urlArray.length - 1];
				if (curGalId.indexOf('#') != -1) {
					curGalId = curGalId.substr(0, curGalId.indexOf('#'));
				}

			    getMediaByGalleryIdJSon(curGalId);
			}

			addCustomFieldDeleteFunctionality();

			if ($('.slug_string').length > 0) {
		  		$('#update_page_form').find('.edit_input').eq(1).css({'margin-top' : '0px'});
		  	}

		  	var tabButtonObjectArray = [
		  		{
		  			button: $('#edit_page_media_button'),
		  			function: showContentBlock
		  		},
		  		{
		  			button: $('#edit_page_content_button'),
		  			function: showContentBlock
		  		},
		  		{
		  			button: $('#edit_page_product_info_button'),
		  			function: showContentBlock
		  		}
		  	];

		  	var editTabMenu = new tabMenu.TabMenu(tabButtonObjectArray, 'tab_button_selected');

		  	$('.uu_success').parent().stop(true, true).delay(3000).animate({
		      	opacity: 0.0
		    },
		    {
		      	duration: 500,
		      	specialEasing: {
		        	opacity: 'easeOutExpo'
		      	},
		      	complete:function() {
		      		$(this).css({'visibility' : 'hidden'});
		      	}
		    });

		    $('#is_product_checkbox').bind('change', onProductCheckboxChange);

		    var currentHash = window.location.hash;
			if (currentHash.substr(1, currentHash.length - 1) == 'editingproductinfo' && $('#is_product_checkbox').is(':checked')) {
				editTabMenu.selectOption(2);
				showContentBlock(2);
			} else if (currentHash.substr(1, currentHash.length - 1) == 'editingproductmedia') {
				editTabMenu.selectOption(0);
				showContentBlock(0);
			} else {
				editTabMenu.selectOption(1);
				showContentBlock(1);
			}

			if ($('#is_product_checkbox').is(':checked')) {
				//
			} else {
				$('#add_media_button').css({'margin-left' : '250px'});
			}

			$('#category_check_boxes input').bind('change', onCategoryCheckboxChange);
		
			$(window).bind('resize', onResize);
			onResize();
		}

		function onProductCheckboxChange() {
			if($(this).is(':checked')){
	        	$('#edit_page_product_info_button').show();
	        	$('#add_media_button').css({'margin-left' : '380px'});
	    	} else {
	    		$('#edit_page_product_info_button').hide();
	    		$('#add_media_button').css({'margin-left' : '250px'});
	    	}
		}

		function onCategoryCheckboxChange() {
			if($(this).is(':checked')){
	        	$(this).next().addClass('checkbox_selected_title');
	    	} else {
	    		$(this).next().removeClass('checkbox_selected_title');
	    	}
		}
		
		/**
		 * Opens the modal window to choose media for a page.
		 *
		 * @param {Event} e A mouse event.
		 */
		function addMediaButtonClick(e) {
		  	var mbArray = [];
		  	mediaBlockArray = [];

		  	$('.in_page_media_block').each(function(){
		    	mbArray.push($(this).attr('data-id'));
		  	});

		  	$('#choose_image_modal').modal(modalSettings2);
		  	$('#choose_page_images').jScrollPane(scrollPaneSettings);
		  	
		  	setupGalleryImages();
		  	
		  	$('.page_media_block').each(function(){
		    	mediaBlockArray.push($(this));
		  	});

		  	checkGalleryMedia(mbArray);

		  	$('#save_images_btn a').unbind();
		  	$('#save_images_btn a').css({'border' : 'none','cursor' : 'pointer'});
		  	$('#save_images_btn a').bind('click', addImagesToGallery);

		  	adminImages.setupSearch();

			sizeGalleryImageContainer();

			return false;
		}

		/**
		 * Adds a new set of custom fields.
		 *
		 */
		function addCustomFieldBlock() {
			$('#custom_fields').append(customFieldBlockHtml);

			addCustomFieldDeleteFunctionality();
		}

		/**
		 * Adds the event listeners to the custom field delete buttons.
		 *
		 */
		function addCustomFieldDeleteFunctionality() {
			$('.custom_field_delete_btn').each(function() {
				$(this).unbind();
				$(this).bind('click', customFieldDeleteClick);
			});
		}

		/**
		 * Removes a custom field.
		 *
		 */
		function customFieldDeleteClick() {
			$(this).parent().find('.custom_field_delete_input').eq(0).val('true');
			$(this).parent().stop(true, true).animate({
		      	opacity: 'hide'
		    },
		    {
		      	duration: 300,
		      	specialEasing: {
		        	opacity: 'easeOutExpo'
		      	}
		    });
		}

		/**
		 * Displays the proper block based on which tab the user clicked.
		 *
		 */
		function showContentBlock(iteration) {
			clearTimeout(showCurrentContentBlockTimeout);

			var currentBlock = contentBlockArray[iteration];

			if (iteration == 0) {
				$('#current_tab_state_input').val('editingproductmedia');
			} else if (iteration == 1) {
				$('#current_tab_state_input').val('editingproductcontent');
			} else if (iteration == 2) {
				$('#current_tab_state_input').val('editingproductinfo');
			}

			for (var i = 0; i < contentBlockArray.length; i++) {
				if (i != iteration && contentBlockArray[i].is(':visible')) {
					$(contentBlockArray[i]).stop(true, true).animate({
				      	opacity: 0.0
				    },
				    {
				      	duration: 200,
				      	specialEasing: {
				        	opacity: 'easeOutExpo'
				      	},
				      	complete:function() {
				      		$(this).hide();
				      	}
				    });
				}

				showCurrentContentBlockTimeout = setTimeout(function() {
					$(currentBlock).stop(true, true).show().css({opacity : 0.0});

		      		$(currentBlock).stop(true, true).animate({
				      	opacity: 1.0
				    },
				    {
				      	duration: 500,
				      	specialEasing: {
				        	opacity: 'easeOutExpo'
				      	}
				    });

				}, 200);
			}

		    return false;
		}

		/**
		 * Adds event listeners to images to choose for page.
		 *
		 */
		function setupGalleryImages() {
		  	$('.page_media_block').unbind();
		  	$('.page_media_block').bind('mouseenter', gmbOver);
		  	$('.page_media_block').bind('mouseleave', gmbOut);
		  	$('.page_media_block').bind('click', gmbClick);
		}

		/**
		 * Checks to see if an image is in the current page.
		 *
		 * @param {Array <string>} pageIdArray An array of ids of
		 * 		images in the page.
		 */
		function checkGalleryMedia(pageIdArray) {
			$('.page_media_block').each(function(){
		    	for (var i = 0; i<pageIdArray.length; i++) {
			      	if (String($(this).attr('data-id')) == String(pageIdArray[i])) {
			        	$(this).addClass('page_media_selected');
			      	}
		    	}
		  	});
		}

		/**
		 * The rollover function for an image in the page modal.
		 *
		 * @param {Event} e A mouse event.
		 */
		function gmbOver(e) {
		  if($(this).attr('class').indexOf('page_media_selected') == -1) {
		    $(this).stop(true, true).animate({
		      	backgroundColor: '#45b87b'
		    },
		    {
		      	duration: 300,
		      	specialEasing: {
		        	backgroundColor: 'easeOutExpo'
		      	}
		    });
		  }
		}

		/**
		 * The rollout function for an image in the page modal.
		 *
		 * @param {Event} e A mouse event.
		 */
		function gmbOut(e) {
		  if($(this).attr('class').indexOf('page_media_selected') == -1) {
		    $(this).stop(true, true).animate({
		      	backgroundColor: '#000000'
		    },
		    {
		      	duration: 300,
		      	specialEasing: {
		        	backgroundColor: 'easeOutExpo'
		      	}
		    });
		  }
		}

		/**
		 * The click function for an image in the page modal.
		 *
		 * @param {Event} e A mouse event.
		 */
		function gmbClick(e) {
			if($(this).attr('class').indexOf('page_media_selected') == -1) {
			    $(this).addClass('page_media_selected');
			    $(this).stop(true, true).animate({
			     	backgroundColor: '#45b87b'
			    },
			    {
			      	duration: 300,
			      	specialEasing: {
			        	backgroundColor: 'easeOutExpo'
			      	}
			    });
		  	} else {
			    $(this).removeClass('page_media_selected');
			    $(this).stop(true, true).animate({
			      	backgroundColor: '#000000'
			    },
			    {
			      duration: 300,
			      specialEasing: {
			        backgroundColor: 'easeOutExpo'
			      }
			    });
			}
		}

		/**
		 * The click function to add the selected images to the page.
		 *
		 * @param {Event} e A mouse event.
		 */
		function addImagesToGallery(e) {
		  	var mediaIdArray = [];
		  	var deleteIdArray = [];

			$('.page_media_selected').each(function() {
			   	var id = String($(this).attr('data-id'));
			    mediaIdArray.push(id); 
			});

		 	$('.page_media_block').each(function(){
		    	var addToDeleteArray = true;
		    	var cur = $(this);

		    	for (var i = 0; i<mediaIdArray.length; i++) {
			      	if(String(cur.attr('data-id')) == String(mediaIdArray[i])) {
			        	addToDeleteArray = false;
			      	}
		    	}

		    	if (addToDeleteArray == true) {
		      		deleteIdArray.push($(this).attr('data-id'));
		    	}
		  	});

		  	var curUrl = window.location.href;
		  	var urlArray = String(curUrl).split('/');
		  	var curGalId = urlArray[urlArray.length - 1];

		  	if (curGalId.indexOf('#') != -1) {
				curGalId = curGalId.substr(0, curGalId.indexOf('#'));
			}

		  	$.ajax({
		  		type: "POST",
		    	url: "/admin/page/addimages",
		    	data: 'media_id_array=' + mediaIdArray + '&delete_id_array=' +
					deleteIdArray + '&page_id=' + curGalId ,
		      	success: function(data){
		        	getMediaByGalleryIdJSon(curGalId);
		        	$.modal.close();
		      	}
		  	});

			return false;
		}

		/**
		 * Gets page images object by page id.
		 *
		 * @param {String} pageId The id of the media object.
		 */
		function getMediaByGalleryIdJSon(pageId) {
			$('#image_load_spinner').show();
			var target = document.getElementById('image_load_spinner');
		  	spinner = new Spinner(spinnerSettings).spin(target);

		  	$.getJSON('/admin/page/getpageimagesjson/' +
				pageId, function(data) {
		    	spinner.stop();
		    	$('#image_load_spinner').hide();

		    	var items = [];

		    	$.each(data, function(key, val) {
		      		items.push(val);
		    	});

		    	if(items.length > 0) {
		      		createGalleryImageBankMenu(items);
		    	} else {
		    		$('#page_media_images').html('<li class="empty_page_message">' + 
					'This page contains no images.</li>');
		  		}

		  		addCustomFieldSortability();

		  	});
		}    

		/**
		 * Creates image thumnails from an array
		 * 		of JSON objects.
		 *
		 * @param {Array <object>} items An array
		 * 		of JSON objects.
		 */
		function createGalleryImageBankMenu(items) {
			var currentUrl = document.location.href;
			var urlArray = currentUrl.split('/')
			var pageId = urlArray[urlArray.length - 1];
			
			for (var i = 0; i<items.length; i++) {
		    	var fe = getFileExt(items[i].filename);
		    	var fne = stripFileExt(items[i].filename);
			    var thumbPath = fne + '_thumb.' + fe;
			    var ml = 0;
			    var mt = 0;
				var newWidth = 0;
				var newHeight = 0;

			    if (items[i].file_width >= items[i].file_height) {
				    newHeight = 100;
					newWidth = (100 / items[i].file_height) * items[i].file_width;
		      		ml = 50 - (newWidth / 2);
		    	} else {
					newWidth = 100;
					newHeight = (100 / items[i].file_width) * items[i].file_height;
		      		mt = 50 - (newWidth / 2);
		    	}

		  	}

		  	for (var i = 0; i<items.length; i++) {
			    var fe = getFileExt(items[i].filename);
			    var fne = stripFileExt(items[i].filename);
			    var thumbPath = fne + '_thumb.' + fe;
          
				items[i].sort_order = (i + 1);
				items[i].thumb_path = thumbPath;
				items[i].page_id = pageId;
			}
		
			var ms = editPageTemplate({images: items});

			if (items.length == 0) {
		    	ms = '<li class="empty_page_message">' + 
					'This page contains no media.</li>';
		  	}

		  	$('#page_media_images').html(ms);

		  	addGallerySortability();
			sizeGalleryImageContainer();
		}

		/**
		 * Sets up the draggable sorting for the custom fields.
		 *
		 */
		function addCustomFieldSortability() {
			$('#custom_fields').sortable({items: 'li',
				forceHelperSize : true, 
				forcePlaceholderSize : true, 
				tolerance : 'pointer',
				update: function(event, ui) {
					// 
				}
			});
		}

		/**
		 * Sets up the draggable sorting for the page view.
		 *
		 */
		function addGallerySortability() {
			$('#page_media_images').sortable({items: 'li',
				forceHelperSize : true, 
				forcePlaceholderSize : true, 
				tolerance : 'pointer',
				update: function(event, ui) {
					var curUrl = window.location.href;
					var urlArray = String(curUrl).split('/');
					var curGalId = urlArray[urlArray.length - 1];
					if (curGalId.indexOf('#') != -1) {
 						curGalId = curGalId.substr(0, curGalId.indexOf('#'));
  					}

					var serialized = $('#page_media_images').sortable('serialize');

					var numContainer = ui.item.find('.page_image_order_num_container');
					numContainer.stop(true, true).css({'background-color' : '#45B97C'});
		      		numContainer.stop(true, true).animate({
			      		backgroundColor: '#000'
				    },
				    {
				      	duration: 1500,
				      	specialEasing: {
				        	backgroundColor: 'easeOutSine'
				      	}
				    });

					$('.in_page_media_block').each(function(i) {
						$(this).find('.page_image_order_num').html((i + 1));
					});

					$.ajax({
						type: "POST",
						url: "/admin/page/changeimageorder",
						data: serialized + '&page_id=' + curGalId,
						success: function(data){
							//alert(data)
						}
					}); 
				}
			});
		}
    
		/**
		 * Changes the width of the page image container.
		 */
		function sizeGalleryImageContainer() {
		  var targHeight = ($(window).height() - 320);
		  if (targHeight < 350) {
		    targHeight = 350;
		  }

		  //$('#page_media_image_container').css({
				//'width' : ($(window).width() - 560) + 'px'});

		  //$('#page_image_block').css({
				//'width' : ($(window).width() - 560) + 'px'});

		  //$('#admin_content.edit_page_admin_content').css({
				//'height' : ($('#page_media_image_container').height() + 100) + 'px'});
		}
		
		/**
		 * Returns just the extension of a filename.
		 *
		 * @param {String} filename The filename.
		 * @return {String} the file extension.
		 */
		function getFileExt(filename) {
		  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
		}

		/**
		 * Returns a filename without the extension.
		 *
		 * @param {String} filename The filename
		 * @return {String} the filename with no extension
		 */
		function stripFileExt(filename) {
		  return filename.substr(0, filename.lastIndexOf('.'))
		}
		
		function onResize(e) {
		  	sizeGalleryImageContainer();

		  	if ($('.slug_string').length > 0) {
		  		$('#update_page_form').find('.edit_input').eq(1).css({'width' : ($(window).width() - 46 - $('.slug_string').eq(0).width()) + 'px'});
		  	}
		}
		
		return {
			init: init,
			setupGalleryImages: setupGalleryImages
		}
});