define(['require', 
	'tag-manager', 
	'sort-manager', 
	'text!manage-images-template.html', 
	'upload-modal-manager', 
	'edit-page', 
	'handlebars', 
	'jquery', 
	'jquery-tagsinput-js', 
	'jquery-dropkick',
	'jquery-jscrollpane', 
	'jquery-fileupload-ui', 
	'jquery-simplemodal', 
	'jquery-templates', 
	'spinner'],

function(requireInstance, tagManagerInstance, sortManagerInstance, manageImageTemplateText, uploadModalManagerInstance) {

	var editImage = requireInstance('edit-image');
	var tagManager = tagManagerInstance;
	var sortManager = sortManagerInstance;
	var manageImageTemplate = Handlebars.compile(manageImageTemplateText);
	var uploadModalManager = uploadModalManagerInstance;
	var editPage;
	var ep = require(['edit-page'], function(editPageInstance) {
		editPage = editPageInstance;
	});
	var tagMenuCreated = false;

	var scrollPaneSettings = {
		autoReinitialise: true
	};

	var modalSettings = {
		overlayClose: true,
		minWidth: 600,
		minHeight: 400
	};

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

	var uploadCompleteInt = 0;
	var sortBlockShowing = false;
	var originalSortBlockHeight = 0;

	//loads images into image bank
	function init() {

		var target = document.getElementById('image_load_spinner');
		spinner = new Spinner(spinnerSettings).spin(target);

		$('#upload_media_btn').bind('click', function(e) {
			uploadModalManager.openUploadModal();
			uploadModalManager.initFileUpload(null, getAdminImages);

			return false;
		});

		getAdminImages();
		setupSearch();
		setupSortToggle();

		$(window).bind('resize', onResize);
	}

	/**
	 * Sets up search field and drop downs.
	 */
	function setupSearch() {
		if($('.search_input').length > 0) {
			$('.search_input').tagsInput({
				'interactive': true,
				'defaultText': 'Search images',
				'width': '270px',
				'height': '30px',
				'onAddTag': tagManager.onTagAdded,
				'onRemoveTag': tagManager.onTagRemoved,
				'onChange': tagManager.onTagChange,
				'removeWithBackspace': true,
				'minChars': 0,
				'maxChars': 0,
				'placeholderColor': '#999'
			});
		}

		if($('#sort_drop_down').length > 0) {
			$('#sort_drop_down').dropkick({
				width: 223,
				change: onDropDownChange
			});
		}
	}

	function setupSortToggle() {
		originalSortBlockHeight = $('#admin_sort_wrapper').height();
		$('#admin_sort_wrapper').hide().css({'visibility' : 'visible', 'margin-bottom' : '0px'});
		$('#sort_toggle_btn').bind('click', toggleSortBlock);
	}

	function toggleSortBlock() {
		if (!sortBlockShowing) {
			$('#sort_toggle_btn').html('Hide sort options');

			sortBlockShowing = true;

			$('#admin_sort_wrapper').stop(true, true).show().css({opacity : 0.0, 'height' : '0px'});
			$('#admin_sort_wrapper').stop(true, true).animate({
				height: originalSortBlockHeight,
				marginBottom: 20
			}, {
				duration: 300,
				specialEasing: {
					height: 'easeOutExpo',
					marginBottom: 'easeOutExpo'
				},
				complete:function() {
					$('#admin_sort_wrapper').stop(true, true).animate({
						opacity : 1.0
					}, {
						duration: 300,
						specialEasing: {
							opacity: 'easeOutSine'
						}
					});
				}
			});
		} else {
			$('#sort_toggle_btn').html('Search / Sort Images');

			sortBlockShowing = false;
			
			$('#admin_sort_wrapper').stop(true, true).animate({
				opacity : 0.0
			}, {
				duration: 300,
				specialEasing: {
					opacity: 'easeOutSine'
				},
				complete:function() {
					$('#admin_sort_wrapper').stop(true, true).animate({
						height: 0,
						marginBottom:0
					}, {
						duration: 300,
						specialEasing: {
							height: 'easeOutExpo',
							marginBottom: 'easeOutExpo'
						},
						complete:function() {
							$('#admin_sort_wrapper').hide();
						}
					});
				}
			});
		}
	}

	/**
	 * Called when adn option is selected from the sort drop down.
	 *
	 * @param <String> value The value of the item selected
	 * @param <String> label The text in the button of the item selected
	 */
	function onDropDownChange(value, label) {
		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane().data().jsp.destroy();
		}

		var curSortArray = [];
		var imageContainer;

		for(var i = 0; i < mediaBlockArray.length; i++) {
			curSortArray.push(mediaBlockArray[i]);
		}

		var st = value;

		if(st == 'date_created_asc') {
			curSortArray.sort(sortManager.createdSortAsc);
		} else if(st == 'date_created_desc') {
			curSortArray.sort(sortManager.createdSortDesc);
		} else if(st == 'date_updated_asc') {
			curSortArray.sort(sortManager.updatedSortAsc);
		} else if(st == 'date_updated_desc') {
			curSortArray.sort(sortManager.updatedSortDesc);
		} else if(st == 'caption_asc') {
			curSortArray.sort(sortManager.captionSortAsc);
		} else if(st == 'caption_desc') {
			curSortArray.sort(sortManager.captionSortDesc);
		} else if(st == 'filename_asc') {
			curSortArray.sort(sortManager.filenameSortAsc);
		} else if(st == 'filename_desc') {
			curSortArray.sort(sortManager.filenameSortDesc);
		}

		if($('#image_block_container').length > 0) {
			imageContainer = $('#image_block_container');
		} else if($('#choose_page_images').length > 0) {
			imageContainer = $('#choose_page_images');
		}

		imageContainer.html('');

		for(var i = 0; i < curSortArray.length; i++) {
			imageContainer.append(curSortArray[i]);
		}

		initMediaBlockContainer();

		if($('#choose_page_images').length > 0) {
			editPage.setupGalleryImages();
		}

		tagManager.reEnableAllTagBtns();

		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane(scrollPaneSettings);
		}
	}

	/**
	 * Gets All Images from the database in JSON format.
	 */
	function getAdminImages() {
		$.ajaxSetup({cache: false});
		$.getJSON('/json/media/all', function(data) {
			var items = [];

			$.each(data, function(key, val) {
				items.push(val);
			});

			createImageBankMenu(items);

			if(tagMenuCreated == false) {
				tagManager.setupTagMenu();
			}

			tagMenuCreated = true;

			initMediaBlockContainer();

		});
	}

	/**
	 * Sets up the image bank.
	 */
	function initMediaBlockContainer() {
		$('.media_block').each(function() {
			$(this).unbind();
			$(this).find('.media_block_cover, .media_block_cover_icon').css({
				opacity: 0.0
			});
			if(!jQuery.browser.mobile) {
				$(this).bind('mouseenter', mbOver);
				$(this).bind('mouseleave', mbOut);
			}
		});

		removeSortability();

		if($('#image_bank_container').attr('class')) {
			if($('#image_bank_container').attr('class').indexOf('in_search') == -1) {
				addSortability();
			}
		} else {
			addSortability();
		}

		sizeImageBankContainer();
	}

	/**
	 * Sets up the image bank for galleries.
	 */
	function initMediaBlockContainerGallery() {
		$('.media_block').each(function() {
			$(this).find('.media_block_cover, .media_block_cover_icon').css({
				opacity: 0.0
			});
			if(!jQuery.browser.mobile) {
				$(this).bind('mouseenter', mbOver);
				$(this).bind('mouseleave', mbOut);
			}
		});
	}

	/**
	 * The rollover for the image thumbnails.
	 *
	 * @param {Event} e A mouse event.
	 */
	function mbOver(e) {
		$(this).find('.media_block_cover').stop(true, true).animate({
			opacity: 0.7
		}, {
			duration: 300,
			specialEasing: {
				opacity: 'easeOutExpo'
			}
		});

		$(this).find('.media_block_cover_icon').stop(true, true).animate({
			opacity: 1.0
		}, {
			duration: 300,
			specialEasing: {
				opacity: 'easeOutExpo'
			}
		});
	}

	/**
	 * The rollout for the image thumbnails.
	 *
	 * @param {Event} e A mouse event.
	 */
	function mbOut(e) {
		$(this).find('.media_block_cover').stop(true, true).animate({
			opacity: 0.0
		}, {
			duration: 300,
			specialEasing: {
				opacity: 'easeOutExpo'
			}
		});

		$(this).find('.media_block_cover_icon').stop(true, true).animate({
			opacity: 0.0
		}, {
			duration: 300,
			specialEasing: {
				opacity: 'easeOutExpo'
			}
		});
	}

	/**
	 * Creates image thumnails from an array
	 * 		of JSON objects.
	 *
	 * @param {Array <object>} items An array
	 * 		of JSON objects.
	 */
	function createImageBankMenu(items) {
		spinner.stop();
		mediaBlockArray = [];

		var ms = '';
		var isSortable = false;
		if($('#image_block_container').attr('class').indexOf('media_sortable_true') != -1) {
			isSortable = true;
		}

		for(var i = 0; i < items.length; i++) {
			var fe = getFileExt(items[i].filename);
			var fne = stripFileExt(items[i].filename);
			var thumbPath = fne + '_thumb.' + fe;

			items[i].sort_order = (i + 1);
			items[i].thumb_path = '/static/uploads/' + thumbPath + '?' + (Math.random() * 100);
		}

		var ms = manageImageTemplate({
			images: items
		});

		$('#image_block_container').html(ms);

		$('.media_block').each(function() {
			mediaBlockArray.push($(this));
			if(isSortable == true) {
				$(this).css({
					'width': '100px',
					'height': '100px'
				});
				$(this).find('a').css({
					'width': '100px',
					'height': '100px'
				});
			}
		});

		if(isSortable == true) {
			addSortability();
		}

	}

	/**
	 * Returns just the extension of a filename.
	 *
	 * @param {String} filename The filename.
	 * @return {String} the file extension.
	 */
	function getFileExt(filename) {
		return(/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
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

	/**
	 * Removes sortability from the main image bank.
	 *
	 * @param {String} pageId The id of the media object.
	 */
	function removeSortability() {
		$('#image_block_container').sortable('destroy');
	}

	/**
	 * Changes the width of the image bank container.
	 */
	function sizeImageBankContainer() {
		/*$('#image_block_container').css({
			'width' : ($(window).width() - 340) + 'px'});

	  var targTagHeight = $('#image_block_container').height() - 20;
	  if (targTagHeight < $(window).height() - 365) {
	    targTagHeight = $(window).height() - 365;
	  }

	  $('#media_tag_container').css({'height' : targTagHeight + 'px'});
	  $('#media_tag_inner').css({'height' : (targTagHeight - 50) + 'px'});*/
	}

	/**
	 * If the page is configured so that images in the main image bank can
	 * 		be sorted, this function sets them up.
	 *
	 * @param {String} pageId The id of the media object.
	 */
	function addSortability() {
		$('#image_block_container').sortable({
			items: 'li',
			forceHelperSize: true,
			forcePlaceholderSize: true,
			tolerance: 'pointer',
			update: function(event, ui) {
				var serialized = $('#image_block_container').sortable('serialize');

				$('.media_block').each(function(i) {
					$(this).find('.page_image_order_num').html((i + 1));
				});

				$.ajaxSetup({cache: false});
				$.ajax({
					type: "POST",
					url: "/admin/media/changemediaorder",
					data: serialized,
					success: function(data) {
						//alert(data)
					}
				});
			}
		});
	}

	function onResize() {
		sizeImageBankContainer();
		$('#admin_sort_wrapper').css({'height' : 'auto'});
		originalSortBlockHeight = $('#admin_sort_wrapper').height();
	}

	return {
		init: init,
		initMediaBlockContainer: initMediaBlockContainer,
		setupSearch: setupSearch
	}

});