define(['upload-modal-manager', 'custom-thumb-modal-manager', 'tab-menu', 'jquery-jrac', 'spinner', 'jquery'],

function(uploadModalManagerInstance, customThumbModalManagerInstance, tabMenu) {

	var uploadModalManager = uploadModalManagerInstance;
	var customThumbModalManager = customThumbModalManagerInstance;
	var imageOriginalWidth;
	var imageOriginalHeight;

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

	var nSpin = new Spinner(spinnerSettings);

	var showCurrentContentBlockTimeout = 0;

	var contentBlockArray = [
		$('#image_edit_wrapper'),
  		$('#image_edit_info_container')
  	];

	function init() {
		//sets up buttons when editing an image
		if($('#image_edit_container').length > 0) {
			$('#update_edit_image_btn').bind('click', function() {
				uploadModalManager.openUploadModal();
				uploadModalManager.initFileUpload(null, function() {
					var curUrl = window.location.href;
					var urlArray = String(curUrl).split('/');
					var curImageId = urlArray[urlArray.length - 1];
					
					getMediaByIdJSon(curImageId);
				});

				return false;
			});

			$('#custom_thumb_edit_image_btn').bind('click', function() {
				customThumbModalManager.openCustomThumbModal();
				customThumbModalManager.initThumbEdit();
				return false;
			});
		}

		if($.trim($('.edit_image_messages').html()).length == 0) {
			$('.edit_image_messages').remove();
		}

		var tabButtonObjectArray = [
	  		{
	  			button: $('#edit_image_button'),
	  			function: showContentBlock
	  		},
	  		{
	  			button: $('#edit_image_info_button'),
	  			function: showContentBlock
	  		}
	  	];

	  	var editTabMenu = new tabMenu.TabMenu(tabButtonObjectArray, 'tab_button_selected');

		$(window).bind('resize', onResize);
		$(document).bind('keydown', keyDownHandler);

		getImageSize();
		sizeEditImage();
		loadEditingImage();

		$('.update_edit_btn_container').css({'visibility' : 'visible'});

		var currentHash = window.location.hash;
		if (currentHash.substr(1, currentHash.length - 1) == 'editinginfo') {
			editTabMenu.selectOption(1);
			showContentBlock(1);
		} else {
			showContentBlock(0);
		}

		if ($('.uu_success').parent().attr('class').indexOf('simplemodal-data') == -1) {
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
		}
	}

	function keyDownHandler(e) {
		if(e.keyCode == 37) {
			var url = $('#next_edit_image_btn').find('a').eq(0).attr('href');
			window.location = url;

			if(e) {
				e.stopPropagation();
			}

			return false;
		}

		if(e.keyCode == 39) {
			var url = $('#next_edit_image_btn').find('a').eq(0).attr('href');
			window.location = url;

			if(e) {
				e.stopPropagation();
			}

			return false;
		}
	}

	/**
	 * Displays the proper block based on which tab the user clicked.
	 *
	 */
	function showContentBlock(iteration) {
		clearTimeout(showCurrentContentBlockTimeout);

		var currentBlock = contentBlockArray[iteration];

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
	 * Loads the image in edit view.
	 */
	function loadEditingImage() {
		$('#editing_image_load_spinner').remove();
		$('#editing_image_container').after($('<div id="editing_image_load_spinner"></div>'));

		var target = document.getElementById('editing_image_load_spinner');
		nSpin.spin(target);

		var imsrc = $('#editing_image_container img').attr('src');
		var img = new Image();

		$(img).load(function() {
			sizeEditImage();

			$('#editing_image_container img').css({
				opacity: 0.0
			}).show();
			
			$('#editing_image_container img').stop(true, true).animate({
				opacity: 1.0
			}, {
				duration: 300,
				specialEasing: {
					opacity: 'easeOutSine'
				}
			});

			nSpin.stop();
			
			$('#editing_image_load_spinner').remove();

		}).error(function() {

		}).attr('src', imsrc);
	}

	/**
	 * Sizes the image in edit view.
	 */
	function getImageSize() {
		var imageWidthHtml = $('.editing_image_info').eq(2).find('span').html();
		var imageHeightHtml = $('.editing_image_info').eq(3).find('span').html();

		imageOriginalWidth = Number(imageWidthHtml.substr(0, imageWidthHtml.length - 2));
		imageOriginalHeight = Number(imageHeightHtml.substr(0, imageHeightHtml.length - 2));
	}

	/**
	 * Sizes the image in edit view.
	 */
	function sizeEditImage() {
		var ei = $('#editing_image_container img');
		var eiw = imageOriginalWidth;
		var eih = imageOriginalHeight;

		var newWidth = eiw;
		var newHeight = eih;

		if(eih >= ($(window).height() - 535)) {
			newHeight = ($(window).height() - 535);
			if(newHeight < 400 && eih >= 400) {
				newHeight = 400;
			}
			newWidth = (newHeight / eih) * eiw;
		}

		if(newWidth > ($(window).width() - 40)) {
			newWidth = ($(window).width() - 40);
			newHeight = (($(window).width() - 40) / eiw) * eih;
		}

		$('#editing_image_container').css({
			'width': newWidth + 'px',
			'height': newHeight + 'px'
		});

		$('#editing_image_container img').css({
			'width': newWidth + 'px',
			'height': newHeight + 'px'
		});

	}

	/**
	 * Gets Media object by id.
	 *
	 * @param {String} mediaId The id of the media object.
	 */
	function getMediaByIdJSon(mediaId) {
		$.ajaxSetup({cache: false});
		$.getJSON('/json/media/' + mediaId, function(data) {

			var ds = '';
			ds += '<a href="/static/uploads/' + data.filename + '" target="_blank">' + "\n";
			ds += ' <img src="/static/uploads/' + data.filename + '" width="' + data.file_width + '" height="' + data.file_height + '">' + "\n";
			ds += '</a>' + "\n";
			$('#editing_image_container').html(ds);

			$('.editing_image_info').eq(0).find('span').html(data.created);
			$('.editing_image_info').eq(1).find('span').html(data.updated);
			$('.editing_image_info').eq(2).find('span').html(data.file_width + 'px');
			$('.editing_image_info').eq(3).find('span').html(data.file_height + 'px');

			getImageSize();

			$('#editing_image_container img').css({'width' : '', 'height' : ''});
			$('.admin_section_header h1').html('Edit: ' + data.filename);
			$('.login_title.editing_image_info').eq(1).html('Last Updated: <span style="font-weight:normal;">' + data.updated + '</span>');

			loadEditingImage();
		});
	}

	function onResize() {
		if($('#editing_image_container').length > 0) {
			sizeEditImage();
		}
	}

	return {
		init: init
	}

});