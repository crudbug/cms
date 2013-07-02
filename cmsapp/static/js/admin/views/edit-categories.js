define(function() {
		
		function init() {
	 		$('#category_blocks').sortable({items: 'li',
				items: 'li',
				forceHelperSize: true,
				forcePlaceholderSize: true,
				tolerance: 'pointer',
				listType: 'ul',
				toleranceElement: '> div',
				update: function(event, ui) {
					var serialized = $('#category_blocks').sortable('toArray');

					ui.item.stop(true, true).css({'background-color' : '#45B97C'});
		      		ui.item.stop(true, true).animate({
			      		backgroundColor: '#E0E1E2'
				    },
				    {
				      	duration: 1500,
				      	specialEasing: {
				        	backgroundColor: 'easeOutSine'
				      	}
				    });

					$.ajaxSetup({cache: false});
					$.ajax({
						type: "POST",
						url: "/admin/category/changecategoryorder",
						data: {'id_array': serialized.join()},
						success: function(data) {
							//alert(data)
						}
					});
				}
			});
		}

		return {
			init: init
		}
});