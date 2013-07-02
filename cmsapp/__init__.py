#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from cmsapp.config import config

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = config.site_database_uri
app.config['UPLOAD_FOLDER'] = config.site_uploads_folder
app.config['ALLOWED_EXTENSIONS'] = \
    config.allowed_media_extensions
app.secret_key = config.site_secret_key
db = SQLAlchemy(app)

import cmsapp.views.admin.user
import cmsapp.views.admin.admin
import cmsapp.views.admin.media
import cmsapp.views.admin.page
import cmsapp.views.admin.category
import cmsapp.views.frontend.frontend

import cmsapp.models.site
import cmsapp.models.user
import cmsapp.models.media
import cmsapp.models.page
import cmsapp.models.productinfo
import cmsapp.models.customfield
import cmsapp.models.category

##########################
# admin routes
##########################

# login and out
##########################
app.add_url_rule('/admin/login', view_func = views.admin.admin.login)

app.add_url_rule('/admin/logout', view_func = views.admin.admin.logout)

app.add_url_rule('/admin/user/check',
    view_func = views.admin.admin.check_user, methods = ['GET', 'POST'])

app.add_url_rule('/admin/forgotpassword',
    view_func = views.admin.admin.forgot_password)

app.add_url_rule('/admin/user/sendpassword',
    view_func = views.admin.user.send_password, methods = ['GET', 'POST'])

#user
##########################
app.add_url_rule('/admin/user/update',
    view_func = views.admin.user.update_user, methods = ['GET', 'POST'])

app.add_url_rule('/admin/user/edit/<user_id>',
    view_func = views.admin.user.edit_user)

app.add_url_rule('/admin/user/manage',
    view_func = views.admin.user.manage_users)

app.add_url_rule('/admin/user/add', view_func = views.admin.user.new_user)

app.add_url_rule('/admin/user/adduser',
    view_func = views.admin.user.add_user, methods = ['GET', 'POST'])

app.add_url_rule('/admin/user/delete/<user_id>',
    view_func = views.admin.user.delete_user)

#main
##########################
app.add_url_rule('/admin/main', view_func = views.admin.admin.admin_main)

#media
##########################
app.add_url_rule('/admin/media',
    view_func = views.admin.admin.admin_images)

app.add_url_rule('/admin/pages',
    view_func = views.admin.admin.admin_pages)

app.add_url_rule('/admin/media/upload',
    view_func = views.admin.media.upload_media, methods = ['GET', 'POST'])

app.add_url_rule('/json/media/all',
    view_func = views.admin.media.get_all_json)

app.add_url_rule('/json/media/<media_id>',
    view_func = views.admin.media.get_by_id_json)

app.add_url_rule('/admin/media/edit/<media_id>',
    view_func = views.admin.media.edit_media)

app.add_url_rule('/admin/media/edit/<media_id>/page/<page_id>',
    view_func = views.admin.media.edit_media)

app.add_url_rule('/admin/media/update/<media_id>',
    view_func = views.admin.media.update_media, methods = ['GET', 'POST'])

app.add_url_rule('/admin/media/changemediaorder',
    view_func = views.admin.media.change_media_order, methods = ['GET', 'POST'])

app.add_url_rule('/admin/media/delete/<media_id>',
    view_func = views.admin.media.delete_media)

app.add_url_rule('/admin/media/crop',
    view_func = views.admin.media.crop_and_save_image, methods = ['GET', 'POST'])

#page
##########################
app.add_url_rule('/admin/page/add', view_func = views.admin.page.new_page)

app.add_url_rule('/admin/page/addpage',
    view_func = views.admin.page.add_page, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/update/<page_id>',
    view_func = views.admin.page.update_page, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/edit/<page_id>',
    view_func = views.admin.page.edit_page, methods = ['GET'])

app.add_url_rule('/admin/page/activate/<page_id>',
    view_func = views.admin.page.activate_page, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/deactivate/<page_id>',
    view_func = views.admin.page.deactivate_page, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/changeorder',
    view_func = views.admin.page.change_page_order, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/addimages',
    view_func = views.admin.page.add_page_images, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/getpageimagesjson/<page_id>',
    view_func = views.admin.page.get_page_images_json, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/changeimageorder',
    view_func = views.admin.page.change_page_image_order, methods = ['GET', 'POST'])

app.add_url_rule('/admin/page/delete/<page_id>',
                 view_func = views.admin.page.delete_page)

#category
##########################
app.add_url_rule('/admin/categories', view_func = views.admin.category.admin_categories)

app.add_url_rule('/admin/category/addcategory',
    view_func = views.admin.category.add_category, methods = ['GET', 'POST'])

app.add_url_rule('/admin/category/changecategoryorder',
    view_func = views.admin.category.change_category_order, methods = ['GET', 'POST'])

app.add_url_rule('/admin/category/delete/<category_id>',
    view_func = views.admin.category.delete_category)

##########################
# frontend routes
##########################

app.add_url_rule('/', view_func = views.frontend.frontend.main)

if __name__ == '__main__':
    app.run()
