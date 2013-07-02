/*!
 * http://jqueryte.com
 * jQuery TE 1.3.3
 * Copyright (C) 2012, Fatih Koca (fattih@fattih.com), AUTHOR.txt (http://jqueryte.com/about)
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this library; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *
*/

(function($){
  $.fn.jqte = function(options){
  
	// default titles of buttons
	var varsTitle = [
		{title:"Font Size"},
		{title:"Color"},
		{title:"Bold",hotkey:"B"},
		{title:"Italic",hotkey:"I"},
		{title:"Underline",hotkey:"U"},
		{title:"Ordered List",hotkey:"."},
		{title:"Unordered List",hotkey:","},
		{title:"Subscript",hotkey:"down arrow"},
		{title:"Superscript",hotkey:"up arrow"},
		{title:"Outdent",hotkey:"left arrow"},
		{title:"Indent",hotkey:"right arrow"},
		{title:"Justify Left"},
		{title:"Justify Center"},
		{title:"Justify Right"},
		{title:"Strike Through",hotkey:"K"},
		{title:"Add Link",hotkey:"L"},
		{title:"Remove Link"},
		{title:"Cleaner Style",hotkey:"Delete"},
		{title:"Horizontal Rule",hotkey:"H"},
		{title:"Source"}
		];
	
	// default font sizes
	var fsizes = ["10","12","16","18","20","24","28"];
	
	// default rgb values of colors
	var colors = [
    "0,0,0","68,68,68","102,102,102","153,153,153","204,204,204","238,238,238","243,243,243","255,255,255",
    null,
    "255,0,0","255,153,0","255,255,0","0,255,0","0,255,255","0,0,255","153,0,255","255,0,255",
    null,
    "244,204,204","252,229,205","255,242,204","217,234,211","208,224,227","207,226,243","217,210,233","234,209,220",
    "234,153,153","249,203,156","255,229,153","182,215,168","162,196,201","159,197,232","180,167,214","213,166,189",
    "224,102,102","246,178,107","255,217,102","147,196,125","118,165,175","111,168,220","142,124,195","194,123,160",
    "204,0,0","230,145,56","241,194,50","106,168,79","69,129,142","61,133,198","103,78,167","166,77,121",
    "153,0,0","180,95,6","191,144,0","56,118,29","19,79,92","11,83,148","53,28,117","116,27,71",
    "102,0,0","120,63,4","127,96,0","39,78,19","12,52,61","7,55,99","32,18,77","76,17,48"
    ];
	
	var linktypes = ["Web Address","E-mail Address","Picture URL"];
	
	// all settings
	var vars = $.extend({
        'css' 		: 'jqte',
		'title'		: true,
		'titletext'	: varsTitle,
		'button'	: 'OK',
		'fsize' 	: true,
		'fsizes'	: fsizes,
		'funit'		: 'px',
		'color'		: true,
		'linktypes'	: linktypes,
		'b' 		: true,
		'i' 		: true,
		'u' 		: true,
		'ol' 		: true,
		'ul' 		: true,
		'sub'		: true,
		'sup'		: true,
		'outdent'	: true,
		'indent'	: true,
		'left'		: true,
		'center'	: true,
		'right'		: true,
		'strike'	: true,
		'link'		: true,
		'unlink'	: true,
		'remove'	: true,
		'rule'		: true,
		'source'	: true
	}, options);
	
	// browser information is received
	var thisBrowser = navigator.userAgent.toLowerCase();
	
	// if browser is ie and it version is 7 or even older, close title property
	if(/msie [1-7]./.test(thisBrowser))
		vars.title = false;
	
	var buttons = [];
	
	// insertion function for parameters to toolbar
	function addParams(name,command,key,tag,emphasis)
	{
		var thisCssNo  = buttons.length+1;
		return buttons.push({name:name, cls:thisCssNo, command:command, key:key, tag:tag, emphasis:emphasis});
	};
	
	// add parameters for toolbar buttons
	addParams('fsize','fSize','','',false); // font size button --> no hotkey
	addParams('color','colors','','',false); // text color button  --> no hotkey
	addParams('b','Bold','B',["b","strong"],true); // bold --> ctrl + b
	addParams('i','Italic','I',["i","em"],true); // italic --> ctrl + i
	addParams('u','Underline','U',["u"],true); // underline --> ctrl + u
	addParams('ol','insertorderedlist','¾',["ol"],true); // ordered list --> ctrl + .(dot)
	addParams('ul','insertunorderedlist','¼',["ul"],true); // unordered list --> ctrl + ,(comma)
	addParams('sub','subscript','(',["sub"],true); // sub script --> ctrl + down arrow
	addParams('sup','superscript','&',["sup"],true); // super script --> ctrl + up arrow
	addParams('outdent','outdent','%',["blockquote"],false); // outdent --> ctrl + left arrow
	addParams('indent','indent','\'',["blockquote"],true); // indent --> ctrl + right arrow
	addParams('left','justifyLeft','','',false); // justify Left --> no hotkey
	addParams('center','justifyCenter','','',false); // justify center --> no hotkey
	addParams('right','justifyRight','','',false); // justify right --> no hotkey
	addParams('strike','strikeThrough','K',["strike"],true); // strike through --> ctrl + K
	addParams('link','linkcreator','L',["a"],true); // insertion link  --> ctrl + L
	addParams('unlink','unlink','',["a"],false); // remove link --> ctrl + N 
	addParams('remove','removeformat','.','',false); // remove all styles --> ctrl + delete
	addParams('rule','inserthorizontalrule','H',["hr"],false); // insertion horizontal rule --> ctrl + H
	addParams('source','displaysource','','',false); // feature of displaying source

	return this.each(function(){
        // element will converted to the jqte editor
		var thisElement = $(this);
		
        // tag name of the element
        var thisElementTag = thisElement.prop('tagName').toLowerCase();
        
        // contents of the element
		var thisElementVal = $(this).is("[value]") || thisElementTag == "textarea" ? $(this).val() : $(this).html();
		
		// start jqte editor to after the element
		thisElement.after('<div class="'+vars.css+'" ></div>');
		
		var $this = thisElement.next('.'+vars.css);
		
		// insert toolbar in jqte editor
		$this.html('<div class="'+vars.css+"_toolbar"+'" role="toolbar" unselectable></div><div class="'+vars.css+'_linkform" style="display:none" role="dialog"></div><div class="'+vars.css+"_editor"+'"></div>');
		
		var toolbar			= $this.find('.'+vars.css+"_toolbar"); // the toolbar variable
		var linkform		= $this.find('.'+vars.css+"_linkform"); // the link-form-area in the toolbar variable
		var editor			= $this.find('.'+vars.css+"_editor"); // the text-field of jqte editor
		var emphasize		= vars.css+"_tool_depressed"; // highlight style of the toolbar buttons
		
		// add to some tools in link form area
		linkform.append('<div class="'+vars.css+'_linktypeselect" unselectable></div> <input class="'+vars.css+'_linkinput" type="text/css" value=""> <div class="'+vars.css+'_linkbutton" unselectable>'+vars.button+'</div> <div style="height:1px;float:none;clear:both"></div>');
		
		var linktypeselect	= linkform.find("."+vars.css+"_linktypeselect"); // the tool of link-type-selector
		var linkinput		= linkform.find("."+vars.css+"_linkinput"); // the input of insertion link
		var linkbutton		= linkform.find("."+vars.css+"_linkbutton"); // the button of insertion link
		
		// add to the link-type-selector sub tool parts
		linktypeselect.append('<div class="'+vars.css+'_linktypeview" unselectable></div><div class="'+vars.css+'_linktypes" role="menu" unselectable></div>');

		var linktypes		= linktypeselect.find("."+vars.css+"_linktypes"); // the select box of link types
		var linktypeview	= linktypeselect.find("."+vars.css+"_linktypeview"); // the link type preview
		var setdatalink		= vars.css+"-setlink"; // the selected text add to mark as "link will be added"
		
		// create to the source-area
		editor.after('<div class="'+vars.css+'_source '+vars.css+'_hiddenField"></div>');
        
        var sourceField = $this.find("."+vars.css+"_source"); // the source-area variable
        
        // move the element to the source-area
        thisElement.appendTo(sourceField);
        
        // if the element isn't a textarea, convert this to textarea
        if(thisElementTag!="textarea")
        {
            var thisElementAttrs = "";
            
            // add all attributes of element to new textarea (type and value except)
            $(thisElement[0].attributes).each(function(){
                if(this.nodeName!="type" && this.nodeName!="value")
                    thisElementAttrs = thisElementAttrs+" "+this.nodeName+'="'+this.nodeValue+'"';
            });
            
            // convert the element to textarea
            thisElement.replaceWith('<textarea '+thisElementAttrs+'>'+thisElementVal+'</textarea>');
            
            // update to variable of thisElement
            thisElement = sourceField.find("textarea");
        }
		
		// add feature editable to the text-field ve copy from the element's value to text-field
		editor.attr("contenteditable","true").html(thisElementVal);

		// insertion the toolbar button
		for(var n = 0; n < buttons.length; n++)
		{
			// if setting of this button is activated (is it true?)
			if(vars[buttons[n].name])
			{
				// if it have a title, add to this button
				var buttonHotkey = buttons[n].key.length>0 ? vars.titletext[n].hotkey!=null && vars.titletext[n].hotkey!="undefined" && vars.titletext[n].hotkey!="" ? ' (Ctrl+'+vars.titletext[n].hotkey+')' : '' : '';
				var buttonTitle = vars.titletext[n].title!=null && vars.titletext[n].title!="undefined" && vars.titletext[n].title!="" ? vars.titletext[n].title+buttonHotkey : '';
				
				// add this button to the toolbar
				toolbar.append('<div class="'+vars.css+'_tool '+vars.css+'_tool_'+buttons[n].cls+'" role="button" data-tool="'+n+'" unselectable><a class="'+vars.css+'_tool_icon" unselectable></a></div>');
				
				// add the parameters to this button
				toolbar.find('.'+vars.css+'_tool[data-tool='+n+']').data({tag : buttons[n].tag, command : buttons[n].command, emphasis : buttons[n].emphasis, title : buttonTitle});
				
				// font-size-selector field
				if(buttons[n].name=="fsize")
				{
					toolbar.find("."+vars.css+'_tool_'+buttons[n].cls)
						.append('<div class="'+vars.css+'_fontsizes" unselectable></div>');
					
					// add font-sizes to font-size-selector
					for(var f = 0; f < vars.fsizes.length; f++)
					{
						toolbar.find("."+vars.css+"_fontsizes").append('<a '+vars.css+'-styleval="'+ vars.fsizes[f] +'" class="'+vars.css+"_fontsize"+'" style="font-size:'+ vars.fsizes[f]  + vars.funit+'" role="menuitem" unselectable>Abcdefgh...</a>');
					}
				}
				
				// color-selector field
				else if(buttons[n].name=="color")
				{
					toolbar.find("."+vars.css+'_tool_'+buttons[n].cls)
						.append('<div class="'+vars.css+'_cpalette" unselectable></div>');
					
					// create color palette to color-selector field
					for(var c = 0; c < colors.length; c++)
					{
                        if(colors[c]!=null)
                            toolbar.find("."+vars.css+"_cpalette").append('<a '+vars.css+'-styleval="'+ colors[c] +'" class="'+vars.css+"_color"+'" style="background-color: rgb('+ colors[c] +')" role="gridcell" unselectable></a>');
                        else
                            toolbar.find("."+vars.css+"_cpalette").append('<div class="'+vars.css+"_colorSeperator"+'"></div>');
					}
				}
			}
		}
		
		// the default value of the link-type
		linktypes.data("linktype","0");
		
		// add link types to link-type-selector
		for(var n = 0; n < 3; n++)
		{
			linktypes.append('<a '+vars.css+'-linktype="'+n+'" unselectable>'+vars.linktypes[n]+'</a>');
			
			linktypeview.html('<div class="'+vars.css+'_linktypearrow" unselectable></div><div class="'+vars.css+'_linktypetext">'+linktypes.find('a:eq('+linktypes.data("linktype")+')').text()+'</div>');
		}
		
		// add the prefix of css according to browser
		var prefixCss = "";

		if(/msie/.test(thisBrowser)) // ie
			prefixCss = '-ms-';
		else if(/chrome/.test(thisBrowser) || /safari/.test(thisBrowser) || /yandex/.test(thisBrowser)) // webkit group (safari, chrome, yandex)
			prefixCss = '-webkit-';
		else if(/mozilla/.test(thisBrowser)) // firefox
			prefixCss = '-moz-';
		else if(/opera/.test(thisBrowser)) // opera
			prefixCss = '-o-';
		else if(/konqueror/.test(thisBrowser)) // konqueror
			prefixCss = '-khtml-';
		
		// make unselectable to unselectable attribute ones
		$this.find("[unselectable]")
			.css(prefixCss+"user-select","none")
			.attr("unselectable","on")
			.on("selectstart mousedown",function(e){e.preventDefault()});
		
		// each button of the toolbar
		var toolbutton = toolbar.find("."+vars.css+"_tool");
		
		// font-size filed
		var fsizebar = toolbar.find("."+vars.css+"_fontsizes");
		
		// color palette
		var cpalette = toolbar.find("."+vars.css+"_cpalette");
		
		// get the selected text as plain format
		function selectionGet()
		{
			// for webkit, mozilla, opera
			if (window.getSelection) {
				return window.getSelection();
			}
			// for ie
			else if (document.selection && document.selection.createRange && document.selection.type != "None")
			{
				return document.selection.createRange();
			}
		}
		
		// the function of changing to the selected text with "execCommand" method
		function selectionSet(addCommand,thirdParam)
		{
			var	range,
				sel = selectionGet();

			// for webkit, mozilla, opera
			if (window.getSelection)
			{
				if (sel.anchorNode && sel.getRangeAt)
					range = sel.getRangeAt(0);
					
				if(range)
				{
					sel.removeAllRanges();
					sel.addRange(range);
				}
				
				if(!thisBrowser.match(/msie/))
					document.execCommand('StyleWithCSS', false, false);
				
				document.execCommand(addCommand, false, thirdParam);
			}
			
			// for ie
			else if (document.selection && document.selection.createRange && document.selection.type != "None")
			{
				range = document.selection.createRange();
				range.execCommand(addCommand, false, thirdParam);
			}
			
            // change styles to around tags
			affectStyleAround(false,false);
		}
		
		// the function of changing to the selected text with tags and tags's attributes
		function replaceSelection(tTag,tAttr,tVal) {
			
            // first, prevent to conflict of different jqte editors
			if(editor.not(":focus"))
				editor.focus();
			
            // for webkit, mozilla, opera			
			if (window.getSelection)
			{
				var selObj = selectionGet(), selRange, newElement, documentFragment;
				
				if (selObj.anchorNode && selObj.getRangeAt)
				{
					selRange = selObj.getRangeAt(0);
					
                    // create to new element
					newElement = document.createElement(tTag);
                    
                    // add the attribute to the new element
					$(newElement).attr(tAttr,tVal);
                    
                    // extract to the selected text
					documentFragment = selRange.extractContents();
                    
                    // add the contents to the new element
					newElement.appendChild(documentFragment);
                    
					selRange.insertNode(newElement);
					selObj.removeAllRanges();
					
					// if the attribute is "style", change styles to around tags
					if(tAttr=="style")
						affectStyleAround($(newElement),tVal);
					// for other attributes
					else
						affectStyleAround($(newElement),false);
				}
			}
            // for ie
			else if (document.selection && document.selection.createRange && document.selection.type != "None")
			{
				var range = document.selection.createRange();
				var selectedText = range.htmlText;
				
				var newText = '<'+tTag+' '+tAttr+'="'+tVal+'">'+selectedText+'</'+tTag+'>';
				
				document.selection.createRange().pasteHTML(newText);
			}
		}
		
		// the function of getting to the parent tag
		var getSelectedNode = function() {
			var node,selection;
			if(window.getSelection) {
				selection = getSelection();
				node = selection.anchorNode;
			}
			if(!node && document.selection && document.selection.createRange && document.selection.type != "None")
			{
				selection = document.selection;
				var range = selection.getRangeAt ? selection.getRangeAt(0) : selection.createRange();
				node = range.commonAncestorContainer ? range.commonAncestorContainer :
					   range.parentElement ? range.parentElement() : range.item(0);
			}
			if(node) {
				return (node.nodeName == "#text" ? $(node.parentNode) : $(node));
			}
			else 
				return false;
		};
		
		// the function of replacement styles to the around tags (parent and child)
		function affectStyleAround(element,style)
		{
			var selectedTag = getSelectedNode(); // the selected node
			
			selectedTag = selectedTag ? selectedTag : element;
			
			// (for replacement with execCommand) affect to child tags with parent tag's styles
			if(selectedTag && style==false)
			{
				// apply to the selected node with parent tag's styles
				if(selectedTag.parent().is("[style]"))
					selectedTag.attr("style",selectedTag.parent().attr("style"));
					
				// apply to child tags with parent tag's styles
				if(selectedTag.is("[style]"))
					selectedTag.find("*").attr("style",selectedTag.attr("style"));
			}
			// (for replacement with html changing method)
			else if(element && style && element.is("[style]"))
			{
				var styleKey = style.split(";"); // split the styles
				
				styleKey = styleKey[0].split(":") // get the key of first style feature
				
                // apply to child tags with parent tag's styles
				if(element.is("[style*="+styleKey[0]+"]"))
					element.find("*").css(styleKey[0],styleKey[1]);
			}
			
            // select to the selected node again
			selectText(selectedTag);
		}
		
		// the function of making selected to a element
		function selectText(element)
		{
			if(element)
			{
				var element = element[0];
				
				if (document.body.createTextRange)
				{
					var range = document.body.createTextRange();
					range.moveToElementText(element);
					range.select();
				}
				else if (window.getSelection)
				{
					var selection = window.getSelection();  
					var range = document.createRange();
					
					if(element != "undefined" && element != null)
					{
						range.selectNodeContents(element);
						
						selection.removeAllRanges();
						selection.addRange(range);
						
						if($(element).is(":empty"))
						{
							$(element).append("&nbsp;");
								selectText($(element));
						}
					}
				}
			}
		}

		// the function of converting text to link
		function selected2link()
		{
			if(!toolbar.data("sourceOpened"))
			{
				var selectedTag = getSelectedNode(); // the selected node
				var thisHrefLink = "http://"; // default the input value of the link-form-field

				// display the link-form-field
				linkAreaSwitch(true);

				if(selectedTag)
				{
					
					var thisTagName  = selectedTag.prop('tagName').toLowerCase();
					
					// if tag name of the selected node is "a" and the selected node have "href" attribute
					if(thisTagName == "a" && selectedTag.is('[href]'))
					{
						thisHrefLink = selectedTag.attr('href');
						
						selectedTag.attr(setdatalink,"");
					}
					// if it don't have "a" tag name
					else 
						replaceSelection("a",setdatalink,"");
					
				}
				else 
					linkinput.val(thisHrefLink).focus();
				
				// the method of displaying-hiding to link-types
				linktypeselect.click(function(e)
				{
					if($(e.target).hasClass(vars.css+"_linktypetext") || $(e.target).hasClass(vars.css+"_linktypearrow"))
						linktypeSwitch(true);
				});
				
				// the method of selecting to link-types
				linktypes.find("a").click(function()
				{
					var thisLinkType = $(this).attr(vars.css+"-linktype");
					
					linktypes.data("linktype",thisLinkType)
					
					linktypeview.find("."+vars.css+"_linktypetext").html(linktypes.find('a:eq('+linktypes.data("linktype")+')').text());
					
					linkInputSet(thisHrefLink);
					
					linktypeSwitch();
				});
				
				linkInputSet(thisHrefLink);
				
				// the method of link-input
				linkinput
                    // auto focus
                    .focus()
					// update to value
					.val(thisHrefLink)
					// the event of key to enter in link-input
					.bind("keypress keyup",function(e)
					{
						if(e.keyCode==13)
						{
							linkRecord($this.find("["+setdatalink+"]"));
							return false;
						}
					});
				
				// the event of click link-button
				linkbutton.click(function()
				{
					linkRecord($this.find("["+setdatalink+"]"));
				});
			}
			else
				// hide the link-form-field
				linkAreaSwitch(false);
		}
		
		function linkRecord(thisSelection)
		{
            // focus to link-input
			linkinput.focus();
			
			// select to the selected node
			selectText(thisSelection);
			
			// remove pre-link attribute (mark as "link will be added") of the selected node
			thisSelection.removeAttr(setdatalink);
			
			// if not selected to link-type of picture
			if(linktypes.data("linktype")!="2")
				selectionSet("createlink",linkinput.val()); // insert link url of link-input to the selected node
			// if selected to link-type of picture
			else
			{
				selectionSet("insertImage",linkinput.val()); // insert image url of link-input to the selected node

				// the method of all pictures in the editor
				editor.find("img").each(function(){
					var emptyPrevLinks = $(this).prev("a");
					var emptyNextLinks = $(this).next("a");
                    
					// if "a" tags of the front and rear of the picture is empty, remove
					if(emptyPrevLinks.length>0 && emptyPrevLinks.html()=="")
						emptyPrevLinks.remove();
					else if(emptyNextLinks.length>0 && emptyNextLinks.html()=="")
						emptyNextLinks.remove();
				});
			}
			
			// hide the link-form-field
			linkAreaSwitch();
			
			// export contents of the text to the sources
			postToSource();
		}
		
		// the function of switching link-form-field
		function linkAreaSwitch(status)
		{
			// remove all pre-link attribute (mark as "link will be added")
			clearSetElement("["+setdatalink+"]:not([href])");
			$this.find("["+setdatalink+"][href]").removeAttr(setdatalink);
			
			if(status)
			{
				toolbar.data("linkOpened",true);
				linkform.slideDown(100);
			}
			else
			{ 
				toolbar.data("linkOpened",false);
				linkform.slideUp(100);
			}
			
			linktypeSwitch();
		}
		
		// the function of switching link-type-selector
		function linktypeSwitch(status)
		{
			if(status)
				linktypes.stop(true,true).delay(100).slideToggle(100);
			else
				linktypes.stop(true,true).delay(100).slideUp(100);
		}
		
		// the function of updating the link-input according to the link-type
		function linkInputSet(thisHrefLink)
		{
			var currentType = linktypes.data("linktype");
			
			// if selected type of e-mail
			if(currentType=="1" && (linkinput.val()=="http://" || linkinput.is("[value^=http://]") || !linkinput.is("[value^=mailto]"))) 
				linkinput.val("mailto:");
			else if(currentType!="1" && !linkinput.is("[value^=http://]"))
					linkinput.val("http://");
			else
				linkinput.val(thisHrefLink);
		}
		
		// the function of adding style to selected text
		function selected2style(styleCommand)
		{
			if(!toolbar.data("sourceOpened"))
			{
				
				// if selected to changing the font-size value
				if(styleCommand=="fSize")
					styleField = fsizebar;
				
				// if selected to changing the text-color value
				else if(styleCommand=="colors")
					styleField = cpalette;
				
				// display the style-field
				styleFieldSwitch(styleField,true);
				
				// the event of click to style button
				styleField.find("a").click(function()
				{
					var styleValue = $(this).attr(vars.css + "-styleval"); // the property of style value to be added 
					
					// if selected to changing the font-size value
					if(styleCommand=="fSize")
					{
						styleType  = "font-size";
						styleValue = styleValue + vars.funit; // combine the value with size unit
						
					}
					// if selected to changing the text-color value
					else if(styleCommand=="colors")
					{
						styleType  = "color";
						styleValue = "rgb("+styleValue + ")"; // combine color value with rgb
					}
					
					var prevStyles = refuseStyle(styleType); // affect styles to child tags (and extract to the new style attributes)
					
					// change to selected text
					replaceSelection("span","style",styleType+":"+styleValue+";"+prevStyles);
					
					// hide all style-fields
					styleFieldSwitch("",false);
					
					// remove title bubbles
					$('.'+vars.css+'_title').remove();
					
					// export contents of the text to the sources
					postToSource();
				});
				
			}
			else
				// hide the style-field
				styleFieldSwitch(styleField,false);
				
			// hide the link-form-field
			linkAreaSwitch(false);
		}
		
		// the function of switching the style-field
		function styleFieldSwitch(styleField,status)
		{			
			var mainData="", // the style data of the actual wanted
				allData = [{"d":"fsizeOpened","f":fsizebar},{"d":"cpallOpened","f":cpalette}]; // all style datas
			
			if(styleField!="") // if the style data of the actual wanted isn't empty
			{
				// return to all datas and find the main data
				for(var si=0; si < allData.length; si++)
				{
					if(styleField==allData[si]["f"])
						mainData = allData[si];
				}
			}
			
			if(status) // display the style-field
			{
				toolbar.data(mainData["d"],true); // stil seçme alanının açıldığını belirten parametre yaz 
				mainData["f"].slideDown(100); // stil seçme alanını aç
				
				// return to all datas and close the fields of external datas
				for(var si=0; si < allData.length; si++)
				{
					if(mainData["d"]!=allData[si]["d"])
					{
						toolbar.data(allData[si]["d"],false);
						allData[si]["f"].slideUp(100);
					}
				}
			}
			else // hide all style-fields
			{
				// return to all datas and close all style fields
				for(var si=0; si < allData.length; si++)
				{
					toolbar.data(allData[si]["d"],false);
					allData[si]["f"].slideUp(100);
				}
			}	
		}
		
		// the function of removing all pre-link attribute (mark as "link will be added")
		function clearSetElement(elem)
		{
			$this.find(elem).each(function(){
				$(this).before($(this).html()).remove();
			});
		}
		
		// the function of refusing some styles
		function refuseStyle(refStyle)
		{
			var selectedTag = getSelectedNode(); // the selected node
			
			// if the selected node have attribute of "style" and it have unwanted style
			if(selectedTag && selectedTag.is("[style]") && selectedTag.css(refStyle)!="")
			{
				var refValue = selectedTag.css(refStyle); // first get key of unwanted style
				
				selectedTag.css(refStyle,""); // clear unwanted style
				
				var cleanStyle = selectedTag.attr("style"); // cleaned style
				
				selectedTag.css(refStyle,refValue); // add unwanted style to the selected node again
				
				return cleanStyle; // print cleaned style
			}
			else
				return "";
		}
		
		// the function of insertion a specific form to texts
		function extractToText(strings)
		{		
			var $htmlContent, $htmlPattern, $htmlReplace;
			
			// first remove unnecessary gaps
			$htmlContent = strings.replace(/\n/g,'').replace(/\r/g,'').replace(/\t/g,'').replace(/&nbsp;/g,' ');
			
			$htmlPattern =  [
				/\<div>(.*?)\<\/div>/ig,
				/\<br>(.*?)\<br>/ig,
				/\<br\/>(.*?)\<br\/>/ig,
				/\<strong>(.*?)\<\/strong>/ig,
				/\<em>(.*?)\<\/em>/ig
			];
			
			$htmlReplace = [
				'<p>$1</p>',
				'<p>$1</p>',
				'<p>$1</p>',
				'<b>$1</b>',
				'<i>$1</i>'
			];
			
			// create loop as the number of pattern
			for (var i = 0; i < $htmlPattern.length; i++) {
			  $htmlContent = $htmlContent.replace($htmlPattern[i], $htmlReplace[i]);
			}
			
			return $htmlContent;
		}
		
		// the function of exporting contents of the text field to the source field (to be the standard in all browsers)
		function postToSource()
		{
			thisElement.val(extractToText( editor.html() ));
		}
		
		// the function of exporting contents of the source field to the text field (to be the standard in all browsers)
		function postToEditor()
		{
			editor.html(extractToText(thisElement.val()));
		}
		
		// the function of getting parent (or super parent) tag name of the selected node
		function detectElement(tags){
		
			var resultdetect=false, $node = getSelectedNode(), parentsTag;
			
			if($node)
			{
				$.each(tags, function(i, val){
					parentsTag = $node.prop('tagName').toLowerCase();

					if (parentsTag == val)
						resultdetect = true;
					else
					{
						$node.parents().each(function(){
							parentsTag = $(this).prop('tagName').toLowerCase();
							if (parentsTag == val)
								resultdetect = true;
						});
					}
				});
				
				return resultdetect;
			}
			else 
				return false;
		};
		
		// the function of highlighting the toolbar buttons according to the cursor position in jqte editor
		function buttonEmphasize(e)
		{
			for(var n = 0; n < buttons.length; n++)
			{				
				if(vars[buttons[n].name] && buttons[n].emphasis && buttons[n].tag!='')
					detectElement(buttons[n].tag) ? toolbar.find('.'+vars.css+'_tool_'+buttons[n].cls).addClass(emphasize) : $('.'+vars.css+'_tool_'+buttons[n].cls).removeClass(emphasize);
				
				// hide all style-fields
				styleFieldSwitch("",false);
			}
		}
		
		// the event of click to the toolbar buttons
		toolbutton
			.click(function(e){
				
				// if source button is clicked
				if($(this).data('command')=='displaysource' && !toolbar.data("sourceOpened"))
				{
					// hide all the toolbar buttons (except the source button)
					toolbar.find("."+vars.css+"_tool").addClass(vars.css+"_hiddenField");
					$(this).removeClass(vars.css+"_hiddenField");
					
					// update to data of source displaying
					toolbar.data("sourceOpened",true);
					
					// equalize height of the text field with height of the source field
					thisElement.css("height",editor.outerHeight());
					
					sourceField.removeClass(vars.css+"_hiddenField");
					editor.addClass(vars.css+"_hiddenField");
					thisElement.focus();
					
					// export contents of the text to the sources
					postToSource();
					
					// hide the link-form-field
					linkAreaSwitch(false);
					
					// hide all style-fields
					styleFieldSwitch("",false);
				}
				// if other buttons is clicked
				else
				{
					// if source field is closed
					if(!toolbar.data("sourceOpened"))
					{
						// if insert-link-button is clicked
						if($(this).data('command')=='linkcreator')
						{
							if(!toolbar.data("linkOpened"))
								selected2link();
							else
							{
								// hide the link-form-field
								linkAreaSwitch(false);
							}
						}
						
						// if the style buttons are clicked
						else if(
							($(this).data('command')=='fSize' && !$(e.target).hasClass(vars.css+"_fontsize")) || // the font-size button
							($(this).data('command')=='colors' && !$(e.target).hasClass(vars.css+"_color")) // the color button
							)
						{
							selected2style($(this).data('command'));
						}
						
						// if other buttons is clicked
						else
						{
                            // first, prevent to conflict of different jqte editors
							if(editor.not(":focus"))
								editor.focus();
								
							// apply command of clicked button to the selected text
							selectionSet($(this).data('command'),null);
							
							// hide the link-form-field
							linkAreaSwitch(false);
							
							// hide all style-fields
							styleFieldSwitch("",false);
							
							// to highlight the toolbar buttons according to the cursor position in jqte editor
							$(this).data('emphasis')==true && !$(this).hasClass(emphasize) ? $(this).addClass(emphasize) : $(this).removeClass(emphasize);
							
							sourceField.addClass(vars.css+"_hiddenField");
							editor.removeClass(vars.css+"_hiddenField");
							
							// export contents of the text to the sources
							postToSource();
						}
					}
					// hide the source field and display the text field
					else
					{
						// update to data of source hiding
						toolbar.data("sourceOpened",false);
						
						// display all the toolbar buttons
						toolbar.find("."+vars.css+"_tool").removeClass(vars.css+"_hiddenField");
						
						sourceField.addClass(vars.css+"_hiddenField");
						editor.removeClass(vars.css+"_hiddenField");
						
						if(editor.not(":focus"))
							editor.focus();
					}
				}
			})
			// the event of showing to the title bubble when mouse over of the toolbar buttons
			.hover(function(e){
				if(vars.title && $(this).data("title")!="" && ( $(e.target).hasClass(vars.css+"_tool") || $(e.target).hasClass(vars.css+"_tool_icon") ))
				{
					$('.'+vars.css+'_title').remove();
					
					// create the title bubble
					$this.append('<div class="'+vars.css+'_title"><div class="'+vars.css+'_titleArrow"><div class="'+vars.css+'_titleArrowIcon"></div></div><div class="'+vars.css+'_titleText">'+$(this).data("title")+'</div></div>');
					
					var thisTitle = $('.'+vars.css+'_title:first');
					var thisArrow = thisTitle.find('.'+vars.css+'_titleArrowIcon');
					var thisPosition = $(this).position();
					var thisAlignX = thisPosition.left + $(this).outerWidth() - (thisTitle.outerWidth()/2) - ($(this).outerWidth()/2);
					var thisAlignY = (thisPosition.top + $(this).outerHeight() + 5);
					
					// show the title bubble and set to its position
					thisTitle.delay(400).css({'top':thisAlignY, 'left':thisAlignX}).fadeIn(200);
				}
			},function(){
				$('.'+vars.css+'_title').remove();
			});
		
		// the methods of the text fields
		editor
		
			// trigger change method of the text field when the text field modified
			.bind("keypress keyup keydown drop cut copy paste DOMCharacterDataModified DOMSubtreeModified",function()
			{
                // export contents of the text to the sources
				if(!toolbar.data("sourceOpened"))
					$(this).trigger("change");
					
				// hide the link-type-field
				linktypeSwitch();
			})
			.bind("change",function()
			{
				if(!toolbar.data("sourceOpened"))
					setTimeout(postToSource,0);
			})
			
			// run to keyboard shortcuts
			.keydown(function(e)
			{
				// if ctrl key is clicked
				if(e.ctrlKey)
				{
					// check all toolbar buttons
					for(var n = 0; n < buttons.length; n++)
					{
						// if this settings of this button is activated (is it true)
						// if the keyed button with ctrl is same of hotkey of this button
						if(vars[buttons[n].name] && e.keyCode == buttons[n].key.charCodeAt(0))
						{
							if(buttons[n].command!='' && buttons[n].command!='linkcreator')
								selectionSet(buttons[n].command,null);
							
							else if(buttons[n].command=='linkcreator')
								selected2link();
								
							return false;
						}
					}
				}
			})
			
			// method of triggering to the highlight button
			.bind("mouseup keyup",buttonEmphasize)
            // the event of focus to the text field
			.focus(function(){
				// hide the link-type-field
				linktypeSwitch()
			})
			
			// the event of focus out from the text field
			.focusout(function(){
				// remove to highlights of all toolbar buttons
				toolbutton.removeClass(emphasize);
				
				// hide all style-fields
				styleFieldSwitch("",false);
				
				// hide the link-type-field
				linktypeSwitch();
			});
		
		// the event of key in the source field
		thisElement
			.bind('keydown keyup',function(){
				// export contents of the source to the text field
				setTimeout(postToEditor,0);
				
				// auto extension for the source field
				$(this).height($(this)[0].scrollHeight);
				
				// if the source field is empty, shorten to the source field
				if($(this).val()=="")
					$(this).height(0);
			});
  	});  
  };
})(jQuery);