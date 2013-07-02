define(['sort-manager'], function() {

	var sortManager;
	require(['sort-manager'], function(sortManagerInstance) {
		sortManager = sortManagerInstance;
	});

	var scrollPaneSettings = {
		autoReinitialise: true
	};

	/**
	 * Loops through media and creates tag menu.
	 */
	function setupTagMenu() {
		var tagArray = [];
		var tagString = '';

		$('.media_block').each(function() {
			var tagList = String(unescape($(this).attr('data-tags')));
			if(tagList != 'None' && tagList != 'null') {
				tagList.split(', ').join(',');
				var tempTagArray = tagList.split(',');
				for(var i = 0; i < tempTagArray.length; i++) {
					if(!checkTagsForDuplicates(tagArray, $.trim(tempTagArray[i])) && $.trim(tempTagArray[i]) != 'None' && $.trim(tempTagArray[i]) != '') {
						tagArray.push($.trim(tempTagArray[i]));
					}
				}
			}
		});

		$('#media_tag_inner').html('');

		tagArray.sort();

		for(var i = 0; i < tagArray.length; i++) {
			tagString += '<div class="tag_button" data-tag="' + tagArray[i] + '">' + tagArray[i] + '</div>' + "\n";
		}

		$('#media_tag_inner').html(tagString);

		$('.tag_button').each(function(i) {
			$(this).bind('mouseenter', tagBtnOver);
			$(this).bind('mouseleave', tagBtnOut);
			$(this).bind('click', tagBtnClick);
		});

	}

	/**
	 * The rollover for the tag buttons.
	 *
	 * @param {Event} e A mouse event.
	 */
	function tagBtnOver() {
		if($(this).attr('class').indexOf('tag_btn_selected') == -1) {
			$(this).stop(true, true).animate({
				color: '#A7A9AC'
			}, {
				duration: 300,
				specialEasing: {
					opacity: 'easeOutExpo'
				}
			});
		}
	}

	/**
	 * The rollout for the tag buttons.
	 *
	 * @param {Event} e A mouse event.
	 */
	function tagBtnOut() {
		if($(this).attr('class').indexOf('tag_btn_selected') == -1) {
			$(this).stop(true, true).animate({
				color: '#2A78B2'
			}, {
				duration: 300,
				specialEasing: {
					opacity: 'easeOutExpo'
				}
			});
		}
	}

	/**
	 * The click for the tag buttons.
	 *
	 * @param {Event} e A mouse event.
	 */
	function tagBtnClick() {
		if($(this).attr('class').indexOf('tag_btn_selected') == -1) {
			var curTag = $(this).attr('data-tag');

			$('.search_input').addTag(curTag);
		}
	}

	/**
	 * "Disables" tag buttons if the tag is in the current search.
	 *
	 * @param {Array} arr The array of tags.
	 */
	function disableTagBtns(arr) {
		for(var i = 0; i < arr.length; i++) {
			$('.tag_button').each(function(it) {
				if(trimString(String($(this).attr('data-tag'))) == String(trimString(arr[i]))) {
					$(this).addClass('tag_btn_selected');
					$(this).stop(true, true).animate({
						color: '#A7A9AC'
					}, {
						duration: 300,
						specialEasing: {
							opacity: 'easeOutExpo'
						}
					});
				}
			});
		}
	}

	/**
	 * Re-enables all tag buttons.
	 */
	function reEnableAllTagBtns() {
		$('.tag_button').each(function(i) {
			$(this).removeClass('tag_btn_selected');
			$(this).stop(true, true).animate({
				color: '#2A78B2'
			}, {
				duration: 300,
				specialEasing: {
					opacity: 'easeOutExpo'
				}
			});
		});
	}

	/**
	 * Callback function for when a tag is added.
	 */
	function onTagAdded() {

		var curTagArray = $('.search_input').val().split(',');

		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane().data().jsp.destroy();
		}

		sortManager.searchMedia(curTagArray);

		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane(scrollPaneSettings);
		}

	}

	/**
	 * Callback function for when a tag is removed.
	 */
	function onTagRemoved() {
		var curTagArray = $('.search_input').val().split(',');

		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane().data().jsp.destroy();
		}

		reEnableAllTagBtns();
		sortManager.searchMedia(curTagArray);

		if($('#choose_page_images').length > 0) {
			$('#choose_page_images').jScrollPane(scrollPaneSettings);
		}

	}

	/**
	 * Callback function for when a tag is changed.
	 */
	function onTagChange() {

	}

	/**
	 * Loops through the tag array and checks if the tag passed
	 * 		is a duplicate.
	 *
	 * @param <Array> tagArray The array of tags for the tag menu.
	 * @param <String> newTag The tag to be added to the array if it
	 * 		is not a duplicate.
	 *
	 * @return Boolean
	 */
	function checkTagsForDuplicates(tagArray, newTag) {
		var isDuplicate = false;

		for(var i = 0; i < tagArray.length; i++) {
			if(tagArray[i] == newTag) {
				isDuplicate = true;
			}
		}

		return isDuplicate;
	}

	function trimString(str) {
		str = str.replace(/^\s+/, '');
		for(var i = str.length - 1; i >= 0; i--) {
			if(/\S/.test(str.charAt(i))) {
				str = str.substring(0, i + 1);
				break;
			}
		}

		return str;
	}

	return {
		setupTagMenu: setupTagMenu,
		reEnableAllTagBtns: reEnableAllTagBtns,
		disableTagBtns: disableTagBtns,
		onTagAdded: onTagAdded,
		onTagRemoved: onTagRemoved,
		onTagChange: onTagChange
	}
});