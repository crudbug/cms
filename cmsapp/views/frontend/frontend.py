#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

import os
import HTMLParser
import simplejson
import urllib
from smtplib import SMTP
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText
from email.MIMEImage import MIMEImage
from email.Utils import COMMASPACE, formatdate
from cmsapp import db
from cmsapp.models.site import Site
from cmsapp.models.page import Page
from cmsapp.models.media import Media
from cmsapp.models.category import Category
from cmsapp.config import config
from cmsapp.models.user import User
from flask import render_template, request, url_for, redirect, flash, session, escape, jsonify
from flask.ext.sqlalchemy import SQLAlchemy

def main():
	"""Shows the main HTML page for the site.  All site urls are routed to this
	function.
	"""

	all_pages = Page.query.filter_by(parent_id=0, active=1).order_by(Page.sort_order).all()
	all_categories = Category.query.order_by(Category.sort_order).all()
	all_pages_array = []
	
	for ap in all_pages:
		ap_ob = create_page_object(ap, 0)
		all_pages_array.append(ap_ob)

	return render_template('frontend/main.html', 
		site_css = config.site_css,
		site_description = config.site_description, 
		site_name = config.site_name,
		site_keywords = config.site_keywords,
		content_object = all_pages_array,
		all_categories = all_categories
	)

def create_page_object(page, parent_id):
	"""Creates objects of Pages that includes an array of the page media and an
	array of its child Pages.
	"""

	page_object = {}
	page_object['page'] = page
	page_media_array = []
	page_category_array = []
	child_page_array = []
	thumb_target_height = 350
	thumb_target_width = 350 
	
	page_media = db.session.execute(
		'select * from page_media where page_id = "%s" order by sort_order' % page.id)
	
	for pm in page_media:
		media_ob = {}
		cur_media = Media.query.filter_by(id=pm.media_id).first()
		just_name = str(os.path.splitext(cur_media.filename)[0])
		just_ext = str(os.path.splitext(cur_media.filename)[1])
		media_ob['thumb'] = just_name + '_thumb' + just_ext
		media_ob['medium'] = just_name + '_medium' + just_ext
		media_ob['media'] = cur_media
		media_ob['sort_order'] = pm.sort_order
		page_media_array.append(media_ob)
	
	page_object['has_media_array'] = False
	if len(page_media_array) > 0:
		page_object['has_media_array'] = True
		page_object['media_array'] = page_media_array

	page_categories = db.session.execute(
		'select * from category_page where page_id = "%s"' % page.id)
	
	for pc in page_categories:
		category_ob = {}
		cur_category = Category.query.filter_by(id = pc.category_id).first()
		page_category_array.append(cur_category)

	page_object['has_category_array'] = False
	if len(page_category_array) > 0:
		page_object['has_category_array'] = True
		page_object['category_array'] = page_category_array

	page_product_info = db.session.execute(
		'select * from product_info where page_id = "%s"' % page.id).first()

	page_object['product_info'] = page_product_info
	
	child_pages = Page.query.filter_by(parent_id = page.id, active = 1).order_by(Page.sort_order).all()
	
	for cp in child_pages:
		cp_ob = create_page_object(cp, page.id)
		child_page_array.append(cp_ob)
	
	page_object['has_child_page_array'] = False
	if len(child_page_array) > 0:
		page_object['has_child_page_array'] = True
		page_object['child_page_array'] = child_page_array
	
	return page_object
	  
def get_media_by_id_json(page_id, image_id):
	""" Returns a json array of media objects associated with a page.
        
        Args:
            page_id: The id of the Page to edit.
    """
	cur_image = Media.query.filter_by(id=image_id).first()
	page_media_array = db.session.execute('select * from page_media where page_id = "%s" order by sort_order' % page_id)
	page_media_list = []
	mob = {}
	next_image_id = 0
	prev_image_id = 0
	image_iteration = 0
	is_next = False
  
	for gm in page_media_array:
		page_media_list.append(gm)
  
	for gl in page_media_list:
		if str(gl.media_id) == str(image_id):
			if len(page_media_list) > 1:
				if int(image_iteration) + 1 > len(page_media_list) - 1:
					next_image_id = page_media_list[0].media_id
				else:
					next_image_id = page_media_list[image_iteration + 1].media_id

				if image_iteration - 1 < 0:
					prev_image_id = page_media_list[len(page_media_list) - 1].media_id
				else:
					prev_image_id = page_media_list[image_iteration - 1].media_id
    
    	image_iteration += 1
    
	mob['id'] = cur_image.id
	mob['filename'] = cur_image.filename
	mob['file_url'] = cur_image.file_url
	mob['file_type'] = cur_image.file_type
	mob['file_width'] = cur_image.file_width
	mob['file_height'] = cur_image.file_height
	mob['video_embed_code'] = cur_image.video_embed_code
	mob['is_video'] = 'false'
	if cur_image.video_embed_code != None and cur_image.video_embed_code != 'None':
		if len(cur_image.video_embed_code) > 0:
			mob['is_video'] = 'true'
	mob['tags'] = cur_image.tags
	mob['caption'] = cur_image.caption
	mob['description'] = cur_image.description
	mob['created'] = str(cur_image.created.strftime('%m%/%d/%Y %I:%M:%S %p'))
	mob['updated'] = str(cur_image.updated.strftime('%m%/%d/%Y %I:%M:%S %p'))
	mob['next_image'] = next_image_id
	mob['prev_image'] = prev_image_id

	return simplejson.dumps(mob) 