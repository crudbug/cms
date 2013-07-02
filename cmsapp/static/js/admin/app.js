require.config({
	baseUrl: '/static/js/admin',
	paths: {
		'dom-ready': 'libs/dom-ready',
		'jquery': 'libs/jquery',
		'jquery-ui': 'libs/jquery-ui',
		'jquery-mousewheel': 'libs/jquery.mousewheel',
		'jquery-dropkick': 'libs/jquery.dropkick-1.0.0',
		'jquery-fileupload': 'libs/jquery.fileupload',
		'jquery-fileupload-ui': 'libs/jquery.fileupload-ui',
		'jquery-jscrollpane': 'libs/jquery.jscrollpane',
		'jquery-iframe-transport': 'libs/jquery.iframe-transport',
		'jquery-simplemodal': 'libs/jquery.simplemodal',
		'jquery-tagsinput-js': 'libs/jquery.tagsinput',
		'jquery-jrac': 'libs/jquery.jrac',
		'jquery-te-1.3.3': 'libs/jquery-te-1.3.3',
		'jquery-templates': 'libs/jquery.tmpl',
		'tab-menu': 'libs/tab-menu',
		'math-utils': 'libs/math-utils',
		'mwheelintent': 'libs/mwheelintent',
		'text': 'libs/require-text',
		'nested-sortable': 'libs/ui.nestedSortable',
		'handlebars': 'libs/handlebars-1.0.0.beta.6',
		'spinner': 'libs/spin',
		'admin-images': 'views/admin-images',
		'edit-image': 'views/edit-image',
		'edit-page': 'views/edit-page',
		'edit-categories' : 'views/edit-categories',
		'tag-manager': 'helpers/tag-manager',
		'sort-manager': 'helpers/sort-manager',
		'upload-modal-manager': 'helpers/upload-modal-manager',
		'custom-thumb-modal-manager': 'helpers/custom-thumb-modal-manager',
		'manage-images-template': 'templates/manage-images',
		'edit-page-template': 'templates/edit-page'
	},
	shim: {
		'handlebars': {
			exports: 'Handlebars'
		},
		'spinner': {
			exports: 'Spinner'
		},
		'jquery-ui' : ['jquery'],
		'jquery-mousewheel' : ['jquery'],
		'jquery-jscrollpane' : ['jquery', 'mwheelintent', 'jquery-mousewheel'],
		'jquery-fileupload' : ['jquery'],
		'jquery-fileupload-ui' : ['jquery', 'jquery-fileupload', 'jquery-iframe-transport'],
		'jquery-iframe-transport' : ['jquery'],
		'tiny-mce' : ['jquery'],
		'jquery-tagsinput-js' : ['jquery'],
		'nested-sortable' : ['jquery', 'jquery-ui'],
		'jquery-simplemodal' : ['jquery'],
		'jquery-templates' : ['jquery'],
		'jquery-jrac' : ['jquery'],
		'jquery-te-1.3.3' : ['jquery'],
		'jquery-dropkick' : ['jquery']
	}
});

require(['dom-ready', 'jquery', 'jquery-ui', 'admin-images', 'edit-image', 'edit-page', 'edit-categories', 'nested-sortable'],

function(domReady, jQueryInstance, jQueryUiInstance, adminImagesInstance, editImageInstance, editPageInstance, editCategoriesInstance, nestedSortableInstance) {

	var adminImages = adminImagesInstance;
	var editImage = editImageInstance;
	var editPage = editPageInstance;
	var editCategories = editCategoriesInstance;

	domReady(function() {


		/**
		 * The variable that will hold the loader.
		 *
		 * @param {Object}
		 */
		var spinner;

		/**
		 * The array that will hold the media thumbnail DOM objects.
		 *
		 * @param {Array}
		 */
		var mediaBlockArray = [];

		/**
		 * Sets everything up.
		 */
		var init = function() {
			'use strict';

			$.ajaxSetup({
				cache: false
			});

			//remove empty seperator div from user section
			//if there is no success or failure message
			if($('.messages').html() == null) {
				$('#message_sep').remove();
				$('.messages').remove();
			}

			if($('#image_bank_container').length > 0) {
				adminImages.init();
			}

			if($('#editing_image_container').length > 0) {
				editImage.init();
			}

			if($('#page_description_input').length > 0) {
				editPage.init();
			}

			if ($('.category_block').length > 1) {
				editCategories.init();
			}

			//sets ajax for activate / deactivate buttons
			setupActivationButtons();

			//setup nested sortable plugin for page sort
			if($('#page_block_container').length > 0) {
				$('ol.sortable').nestedSortable({
					maxLevels: 3,
					disableNesting: 'no-nest',
					forcePlaceholderSize: true,
					handle: 'div',
					helper: 'clone',
					items: 'li',
					opacity: .6,
					placeholder: 'placeholder',
					revert: 250,
					tabSize: 25,
					tolerance: 'pointer',
					toleranceElement: '> div',
					stop: function(event, ui) {
						var serialized = JSON.stringify($('ol.sortable').nestedSortable('toHierarchy'));
						$.ajax({
							type: "POST",
							url: "/admin/page/changeorder",
							data: 'order_object_array=' + serialized,
							success: function(data) {
								//alert(data)
							}
						});
					}
				})
			}
		}

		/**
		 * Adds AJAX functionality to activate/deactivate buttons.
		 */
		var setupActivationButtons = function() {
			$('.page_block_activate_btn_deactivate').each(function(i) {

				var originalElement = $(this);

				$(this).find('a').unbind('click');

				$(this).find('a').bind('click', function() {

					var href = $(this).attr('href');

					$.ajax({
						type: "POST",
						url: href,
						success: function(data) {
							originalElement.removeClass('page_block_activate_btn_deactivate');
							originalElement.addClass('page_block_activate_btn_activate');
							originalElement.find('a').html('ACTIVATE');

							setupActivationButtons();
						}
					});

					return false;
				});

			});

			$('.page_block_activate_btn_activate').each(function(i) {
				var originalElement = $(this);

				$(this).find('a').unbind('click');

				$(this).find('a').bind('click', function() {

					var href = $(this).attr('href');

					$.ajax({
						type: "POST",
						url: href,
						success: function(data) {
							originalElement.removeClass('page_block_activate_btn_activate');
							originalElement.addClass('page_block_activate_btn_deactivate');
							originalElement.find('a').html('DEACTIVATE');

							setupActivationButtons();
						}
					});

					return false;
				});
			})
		}

		init();

	});
});