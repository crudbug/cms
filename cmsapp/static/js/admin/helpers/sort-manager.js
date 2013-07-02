define(['admin-images', 'tag-manager', 'edit-page'],

function() {
	var adminImages;
	require(['admin-images'], function(adminImagesInstance) {
		adminImages = adminImagesInstance;
	});

	var tagManager;
	require(['tag-manager'], function(tagManagerInstance) {
		tagManager = tagManagerInstance;
	});

	var editPage;
	require(['edit-page'], function(editPageInstance) {
		editPage = editPageInstance;
	});

	/**
	 * Removes all sorting from media thumbnails.
	 */
	function resetMedia() {
		var imageContainer;

		if($('#choose_page_images').length > 0) {
			imageContainer = $('#choose_page_images');
		}

		imageContainer.html('');
		for(var i = 0; i < mediaBlockArray.length; i++) {
			imageContainer.append(mediaBlockArray[i]);
		}

		searchMedia(['']);

		reEnableAllTagBtns();

		return false;
	}

	/**
	 * Searches the thumbnails and arranges them
	 * 		based on the results.
	 *
	 * @param {String} searchTerm The search keyword.
	 */
	function searchMedia(searchTermArray) {
		var curSearchArray = [];
		var imageContainer;

		if(searchTermArray[0] == '') {
			$('#image_bank_container').removeClass('in_search');
		} else {
			$('#image_bank_container').addClass('in_search');
		}

		for(var i = 0; i < mediaBlockArray.length; i++) {
			var pushToArray = false;
			var foundMatchCount = 0;

			for(var t = 0; t < searchTermArray.length; t++) {

				var foundMatch = false;

				if(unescape(mediaBlockArray[i].attr('data-filename')).toLowerCase().indexOf(searchTermArray[t].toLowerCase()) != -1) {
					foundMatch = true;
				}

				if(unescape(mediaBlockArray[i].attr('data-caption')).toLowerCase().indexOf(searchTermArray[t].toLowerCase()) != -1) {
					foundMatch = true;
				}

				if(unescape(mediaBlockArray[i].attr('data-description')).toLowerCase().indexOf(searchTermArray[t].toLowerCase()) != -1) {
					foundMatch = true;
				}

				if(unescape(mediaBlockArray[i].attr('data-tags')).toLowerCase().indexOf(searchTermArray[t].toLowerCase()) != -1) {
					foundMatch = true;
				}

				if(foundMatch) {
					foundMatchCount++;
				}
			}

			if(foundMatchCount == searchTermArray.length || searchTermArray[0] == '') {
				pushToArray = true;
			}

			if(pushToArray) {
				curSearchArray.push(mediaBlockArray[i]);
			}
		}

		for(var t = 0; t < searchTermArray.length; t++) {

			if(pushToArray) {
				curSearchArray.push(mediaBlockArray[i]);
			}
		}

		curSearchArray = jQuery.unique(curSearchArray);

		if(searchTermArray[0] == '') {
			curSearchArray.sort(sortOrderSortAsc);
		}

		if($('#image_block_container').length > 0) {
			imageContainer = $('#image_block_container');
		} else if($('#choose_page_images').length > 0) {
			imageContainer = $('#choose_page_images');
		}

		imageContainer.html('');
		for(var i = 0; i < curSearchArray.length; i++) {
			imageContainer.append(curSearchArray[i]);
		}

		if(curSearchArray.length == 0) {
			imageContainer.html('<div class="empty_media_search_msg">' + 'Sorry, no results were found.</div>');
		}

		if($('#image_block_container').length > 0) {
			adminImages.initMediaBlockContainer();
		}

		if($('#choose_page_images').length > 0) {
			editPage.setupGalleryImages();
		}

		tagManager.disableTagBtns(searchTermArray);

	}

	/**
	 * Sorts the array of thumbnails in ascending order
	 * 		based on date created.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * 		being compared.
	 */
	function createdSortAsc(ob1, ob2) {
		if(ob1.attr('data-created') > ob2.attr('data-created')) return 1;
		if(ob1.attr('data-created') < ob2.attr('data-created')) return -1;
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in descending order
	 * based on date created.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * being compared.
		 */
	function createdSortDesc(ob1, ob2) {
		if(ob1.attr('data-created') > ob2.attr('data-created')) return -1;
		if(ob1.attr('data-created') < ob2.attr('data-created')) return 1;
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in ascending order
	 * based on date updated.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * being compared.
	 */
	function updatedSortAsc(ob1, ob2) {
		if(ob1.attr('data-updated') > ob2.attr('data-updated')) return 1;
		if(ob1.attr('data-updated') < ob2.attr('data-updated')) return -1;
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in descending order
	 * based on date updated.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * being compared.
	 */
	function updatedSortDesc(ob1, ob2) {
		if(ob1.attr('data-updated') > ob2.attr('data-updated')) return -1;
		if(ob1.attr('data-updated') < ob2.attr('data-updated')) return 1;
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in ascending order
	 * based on caption.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * being compared.
	 */
	function captionSortAsc(ob1, ob2) {
		var nameA = ob1.attr('data-caption').toLowerCase(),
			nameB = ob2.attr('data-caption').toLowerCase();
		if(nameA < nameB) return -1
		if(nameA > nameB) return 1
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in descending order
	 * 		based on caption.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * 		being compared.
	 */
	function captionSortDesc(ob1, ob2) {
		var nameA = ob1.attr('data-caption').toLowerCase(),
			nameB = ob2.attr('data-caption').toLowerCase();
		if(nameA > nameB) return -1
		if(nameA < nameB) return 1
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in ascending order
	 * 		based on filename.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * 		being compared.
	 */
	function filenameSortAsc(ob1, ob2) {
		var nameA = ob1.attr('data-filename').toLowerCase(),
			nameB = ob2.attr('data-filename').toLowerCase();
		if(nameA < nameB) return -1
		if(nameA > nameB) return 1
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in descending order
	 * 		based on date filename.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * 		being compared.
	 */
	function filenameSortDesc(ob1, ob2) {
		var nameA = ob1.attr('data-filename').toLowerCase(),
			nameB = ob2.attr('data-filename').toLowerCase();
		if(nameA > nameB) return -1
		if(nameA < nameB) return 1
		return 0;
	}

	/**
	 * Sorts the array of thumbnails in descending order
	 * 		based on sort order.
	 *
	 * @param {Object} ob1 A jQuery object
	 * @param {Object} ob2 A jQuery object
	 * @return the new order of the two objects
	 * 		being compared.
	 */
	function sortOrderSortAsc(ob1, ob2) {
		var nameA = Number(ob1.attr('data-sort-order')),
			nameB = Number(ob2.attr('data-sort-order'));
		if(nameA < nameB) return -1
		if(nameA > nameB) return 1
		return 0;
	}

	return {
		createdSortAsc: createdSortAsc,
		createdSortDesc: createdSortDesc,
		updatedSortAsc: updatedSortAsc,
		updatedSortDesc: updatedSortDesc,
		captionSortAsc: captionSortAsc,
		captionSortDesc: captionSortDesc,
		filenameSortAsc: filenameSortAsc,
		filenameSortDesc: filenameSortDesc,
		sortOrderSortAsc: sortOrderSortAsc,
		searchMedia: searchMedia
	}
})