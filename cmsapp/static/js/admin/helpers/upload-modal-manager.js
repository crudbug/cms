define(['jquery', 'jquery-jscrollpane', 'jquery-fileupload-ui', 'jquery-simplemodal'

], function() {

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

	/**
	 * Opens the upload modal window.
	 *
	 * @param {Event} e A mouse event.
	 */
	function openUploadModal(e) {
		uploadCompleteInt = 0;
		$('#fileupload').fileupload('destroy');
		$('#fileupload').modal(modalSettings);
		$('.fileupload-content').jScrollPane(scrollPaneSettings);
		return false;
	}

	/**
	 * Sets up multi-file upload.
	 */
	function initFileUpload(singleCompleteFunction, multipleCompleteFunction) {
		var limit = undefined;
		var isEdit = false;
		if($('#update_edit_btn_container').length > 0) {
			isEdit = true;
			limit = 1;
		}

		// Initialize the jQuery File Upload widget:
		$('#fileupload').fileupload({
			progressall: function(e, data) {
				if(data.loaded == data.total && isEdit == true) {
					var curUrl = document.URL;
					var curUrlArray = curUrl.split('/');
					var curId = curUrlArray[curUrlArray.length - 1];

					if (curId.indexOf('#') != -1) {
						curId = curId.substr(0, curId.indexOf('#'));
					}

					var target = document.getElementById('editing_image_load_spinner');
					var nSpin = new Spinner(spinnerSettings).spin(target);
					$('#editing_image_container').data('spinner', nSpin);

					singleCompleteFunction(curId);

					$.modal.close();
				}
			},

			completeFunction: function() {
				uploadCompleteInt++;
				if(uploadCompleteInt == $('.template-upload').length) {
					$.modal.close();
					var target = document.getElementById('image_load_spinner');
					spinner = new Spinner(spinnerSettings).spin(target);
					multipleCompleteFunction();
				}
			},

			maxNumberOfFiles: limit
		});

		// Open download dialogs via iframes,
		// to prevent aborting current uploads:
		$('#fileupload .files a:not([target^=_blank])').live('click', function(e) {
			e.preventDefault();
			$('<iframe style="display:none;"></iframe>').prop('src', this.href).appendTo('body');
		});
	}

	return {
		openUploadModal: openUploadModal,
		initFileUpload: initFileUpload
	}

});