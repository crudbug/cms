#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

import pickle
import os
import simplejson
import urllib
import time
import datetime
from cmsapp import db
from cmsapp.config import config
from cmsapp.models.site import Site
from cmsapp.models.page import Page
from cmsapp.models.media import Media
from cmsapp.models.customfield import CustomField
from cmsapp.models.user import User
from cmsapp.models.productinfo import ProductInfo
from cmsapp.models.category import Category
from cmsapp.views.admin import admin
from cmsapp.helpers import ownership
from flask import render_template, request, url_for, redirect, flash, \
    session
from flask import escape
from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug import generate_password_hash, check_password_hash


def new_page():
    """ Shows the view where the user can add a new Page.
    """

    if session and session['logged_in']:
        user_is_admin = session['user_is_admin']

        return render_template('admin/admin_page_add.html',
            user_is_admin = user_is_admin,
            site_name = config.site_name,
            powered_by_link = admin.create_powered_by_link())
    else:
        return redirect('/admin/login')


def add_page():
    """ Creates a new Page and adds the info to the database.
    """

    if session and session['logged_in']:
        slug = request.form['slug']
        title = request.form['title']

        if not title:
            flash('Page must have a title.', 'uu_error')

            return redirect('/admin/page/add')
        if not slug:
            flash('Page must have a slug (url).', 'uu_error')

            return redirect('/admin/page/add')

        elif check_slug_for_duplicates(slug) == True:
            flash('Page slug (url) must be unique. Another page already has that slug.', 'uu_error')

            return redirect('/admin/page/add')
        else:
            title = request.form['title']
            slug = slug.replace(' ', '-')
            slug = slug.replace('/', '')
            slug = urllib.quote(slug)
            slug = slug.lower()
            description = request.form['description']
            now = datetime.datetime.now()
            top_level_pages = Page.query.filter_by(site_id = session['site_id'
                    ], parent_id = 0).order_by(Page.sort_order).all()
            highest_sort = 0
            is_product = 0

            if 'is_product' not in request.form:
                check_product = ''
            else:
                check_product = 'checked'
                is_product = 1

            for tl in top_level_pages:
                if int(tl.sort_order) > int(highest_sort):
                    highest_sort = tl.sort_order

            new_page = Page(
                session['site_id'],
                title,
                slug,
                description,
                highest_sort + 1,
                0,
                0,
                now,
                now,
                is_product)

            db.session.add(new_page)
            db.session.commit()

            flash('Page successfully created.', 'uu_success')

            return redirect('/admin/page/edit/' + str(new_page.id))
    else:
        return redirect('/admin/login')

def edit_page(page_id):
    """ Shows the Page edit view.
        
        Args:
            page_id: The id of the Page to edit.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id = page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            category_object_array = []
            current_category_object_array = []
            site_categories = Category.query.filter_by(site_id = session['site_id']).all()
            current_page_categories = db.session.execute('select * from category_page where page_id = "%s"'
                % page_id)
            for cur_cat in current_page_categories:
                current_category_object_array.append(cur_cat)

            user_is_admin = session['user_is_admin']
            all_media_array = []
            all_media = Media.query.filter_by(site_id =session['site_id'
                    ]).order_by(Media.sort_order).all()
            custom_fields = \
                CustomField.query.filter_by(page_id = cur_page.id).order_by(CustomField.sort_order).all()

            #create new objects for all of the categories, adding a "checked" variable
            #if the page belongs to this category, so the proper category
            #checkbox will be checked.
            for cat in site_categories:
                cob = {}
                cob['model'] = cat
                is_checked = ''
                for cur_cat in current_category_object_array:
                    if (int(cur_cat.category_id) == int(cat.id)):
                        is_checked = 'checked'
                
                cob['checked'] = is_checked

                category_object_array.append(cob)

            category_count = len(category_object_array)

            for am in all_media:
                aob = {}
                aob['media'] = am
                just_name = str(os.path.splitext(am.filename)[0])
                just_ext = str(os.path.splitext(am.filename)[1])
                aob['thumb_path'] = just_name + '_thumb' + just_ext
                all_media_array.append(aob)

            slug_string = ''

            if cur_page.parent_id != 0:
                slug_string = config.site_url \
                    + get_slug_string(cur_page.parent_id)

            is_product = cur_page.is_product
            check_product = ''
            product_info_price = 0
            product_info_weight = 0
            product_info_notes = ''
            check_out_of_stock = ''

            if is_product == 1:
                check_product = 'checked'

                cur_product_info = ProductInfo.query.filter_by(page_id = page_id).first()
                if cur_product_info is not None:
                    if cur_product_info.out_of_stock == 1:
                        check_out_of_stock = 'checked'
                    product_info_price = cur_product_info.price
                    product_info_weight = cur_product_info.weight
                    product_info_notes = cur_product_info.notes

            return render_template(
                'admin/admin_page_edit.html',
                user_is_admin = user_is_admin,
                site_name = config.site_name,
                cur_page = cur_page,
                custom_fields = custom_fields,
                custom_field_amount = len(custom_fields),
                all_media_array = all_media_array,
                slug_string = slug_string,
                check_product = check_product,
                product_info_price = product_info_price,
                product_info_weight = product_info_weight,
                product_info_notes = product_info_notes,
                check_out_of_stock = check_out_of_stock,
                category_count = category_count,
                current_page_categories = current_page_categories,
                site_categories = category_object_array,
                powered_by_link = admin.create_powered_by_link())
    else:
        return redirect('/admin/login')


def activate_page(page_id):
    """Sets a Page's 'active' property to 1.
    
    Args:
        page_id: The id of the Page to activate.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id = page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            cur_page.active = 1
            db.session.commit()

            return redirect('/admin/pages')
    else:
        return redirect('/admin/login')


def deactivate_page(page_id):
    """Sets a Page's 'active' property to 0.
        
        Args:
            page_id: The id of the Page to deactivate.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id=page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            cur_page.active = 0
            db.session.commit()

            return redirect('/admin/pages')
    else:
        return redirect('/admin/login')


def get_page_images_json(page_id):
    """ Gets all of the Media assigned to a Page.
        
        Args:
            page_id: The id of the Page containing the images.

        Returns: An array of JSON objects.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id=page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            cur_media_array = []
            page_images = \
                db.session.execute('select * from page_media where page_id = "%s" order by sort_order'
                                    % page_id)
            thumb_target_height = 100

            for gi in page_images:
                cur_image = \
                    Media.query.filter_by(id=gi.media_id).first()

                if cur_image != None:
                    gob = {}
                    just_name = \
                        str(os.path.splitext(cur_image.filename)[0])
                    just_ext = \
                        str(os.path.splitext(cur_image.filename)[1])
                    gob['thumb_path'] = just_name + '_thumb' + just_ext
                    gob['id'] = cur_image.id
                    gob['filename'] = cur_image.filename
                    gob['file_url'] = cur_image.file_url
                    gob['file_type'] = cur_image.file_type
                    gob['file_width'] = cur_image.file_width
                    gob['file_height'] = cur_image.file_height
                    gob['thumb_width'] = float(thumb_target_height) \
                        / float(cur_image.file_height) \
                        * float(cur_image.file_width)
                    gob['thumb_height'] = thumb_target_height
                    gob['tags'] = cur_image.tags
                    gob['caption'] = cur_image.caption
                    gob['description'] = cur_image.description
                    gob['created'] = \
                        str(cur_image.created.strftime('%m%/%d/%Y %I:%M:%S %p'))
                    gob['updated'] = \
                        str(cur_image.updated.strftime('%m%/%d/%Y %I:%M:%S %p'))
                    cur_media_array.append(gob)

            return simplejson.dumps(cur_media_array)
    else:
        return redirect('/admin/login')


def get_slug_string(page_id):
    """ Creates a string of the full url of a Page, based on the site_url config
        property and the slug of the Page's parent Page.
        
        Args:
            id: The id of the Page to get the slug from.
        """

    if session and session['logged_in']:
        page = Page.query.filter_by(site_id = session['site_id'],
            id = page_id).first()

        if ownership.check_ownership(page.site_id):
            slug_string = ''
            slug_string = page.slug + '/' + slug_string

            if page.parent_id != 0:
                slug_string = get_slug_string(page.parent_id) \
                    + slug_string

            return slug_string
    else:
        return redirect('/admin/login')


def update_page(page_id):
    """ Updates a Page.
        
        Args:
            page_id: The id of the Page to get the slug from.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id = page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            slug = request.form['slug']

            if not slug:
                flash('Page must have a slug (url)', 'uu_error')

                return redirect('/admin/page/edit/' + str(cur_page.id))
            elif check_slug_for_duplicates(slug, page_id) == True:
                flash('Page slug (url) must be unique. Another page already has that slug.', 'uu_error')

                return redirect('/admin/page/edit/' + str(cur_page.id))
            else:
                current_tab_state = request.form['current_tab_state']
                title = request.form['title']
                page_type = ''
                is_gallery = ''
                custom_field_titles = \
                    request.form.getlist('custom_field_title')
                custom_field_values = \
                    request.form.getlist('custom_field_value')
                custom_field_values_2 = \
                    request.form.getlist('custom_field_value_2')
                custom_field_ids = request.form.getlist('custom_field_id')
                custom_field_delete_ids = \
                    request.form.getlist('custom_field_delete')
                now = datetime.datetime.now()
                is_product = 0

                if 'is_product' not in request.form:
                    check_product = ''
                    cur_product_info = ProductInfo.query.filter_by(page_id = page_id).first()
                    if cur_product_info is not None:
                        db.session.delete(cur_product_info)
                        db.session.commit()
                else:
                    check_product = 'checked'
                    is_product = 1
                    cur_product_info = ProductInfo.query.filter_by(page_id = page_id).first()
                    is_out_of_stock = 1

                    if 'is_out_of_stock' not in request.form:
                        is_out_of_stock = 0

                    if cur_product_info is not None:
                        cur_product_info.price = request.form['product_price']
                        cur_product_info.weight = request.form['product_weight']
                        cur_product_info.quantity = request.form['product_quantity']
                        cur_product_info.out_of_stock = is_out_of_stock
                        cur_product_info.notes = request.form['product_notes']

                    else:
                        new_product_info = ProductInfo(
                            session['site_id'],
                            page_id,
                            request.form['product_price'],
                            request.form['product_weight'],
                            request.form['product_quantity'],
                            is_out_of_stock,
                            request.form['product_notes']
                        )

                        db.session.add(new_product_info)
                    
                    db.session.commit()

                add_page_custom_fields(page_id,
                    custom_field_titles, 
                    custom_field_values, 
                    custom_field_values_2,
                    custom_field_ids, 
                    custom_field_delete_ids)

                new_page_categories = request.form.getlist('checked_category')
                add_page_categories(page_id, new_page_categories)

                slug = slug.replace(' ', '-')
                slug = slug.replace('/', '')
                slug = urllib.quote(slug)
                slug = slug.lower()
                description = request.form['description']

                cur_page.title = title
                cur_page.slug = slug
                cur_page.description = description
                cur_page.updated = now
                cur_page.is_product = is_product

                db.session.commit()

                flash('Page successfully updated.', 'uu_success')

                print 'current_tab_state = ' + current_tab_state

                return redirect('/admin/page/edit/' + str(cur_page.id) + '#' + str(current_tab_state))
    else:
        return redirect('/admin/login')


def add_page_custom_fields(page_id, custom_field_titles, custom_field_values, custom_field_values_2, custom_field_ids, custom_field_delete_ids):
    """ Updates a Page's custom fields.
        
        Args:
            page_id: The id of the Page to get the slug from.
            custom_field_titles: The array of the custom field titles.
            custom_field_values: The array of the custom field values.
            custom_field_values_2: The array of the second custom field values.
            custom_field_ids: The array of all of the custom field ids associated with the Page.
            custom_field_delete_ids: The array of the custom field ids to delete.
    """
    
    custom_field_count = 0
    now = datetime.datetime.now()

    for index in range(len(custom_field_titles)):
        valid_field = True
        if custom_field_titles[index] == '' \
            and custom_field_values[index] == '':
                valid_field = False

        if custom_field_delete_ids[index] == 'true':
            valid_field = False
            cur_field = \
                CustomField.query.filter_by(id = custom_field_ids[index]).order_by(CustomField.sort_order).one()
            db.session.delete(cur_field)

        if valid_field == True:
            custom_field_count = custom_field_count + 1

            if custom_field_ids[index] != 'new':
                cur_field = \
                    CustomField.query.filter_by(id = custom_field_ids[index]).order_by(CustomField.sort_order).one()
                cur_field.title = custom_field_titles[index]
                cur_field.value = custom_field_values[index]
                cur_field.value_2 = custom_field_values_2[index]
                cur_field.sort_order = custom_field_count
                cur_field.updated = now
            else:
                cs = CustomField(
                    session['site_id'],
                    custom_field_titles[index],
                    custom_field_values[index],
                    custom_field_values_2[index],
                    custom_field_count,
                    page_id,
                    now,
                    now)

                db.session.add(cs)

            db.session.commit()


def add_page_categories(page_id, new_page_categories):
    """ Adds categories to a Page and removes all others.
        
        Args:
            page_id: The id of the Page to get add the categories to.
            new_page_categories: The array of category ids to add to the Page.
    """

    site_categories = Category.query.filter_by(site_id = session['site_id']).all()
    current_page_category_objects = []
    current_page_categories = db.session.execute('select * from category_page where page_id = "%s"'
        % page_id)

    for cur_cat in current_page_categories:
        current_page_category_objects.append(cur_cat)
    
    category_ids_to_delete = []

    #add the checked categories
    for new_cat in new_page_categories:
        should_add = True
        
        for cur_cat in current_page_category_objects:
            if int(new_cat) == int(cur_cat.category_id):
                should_add = False

        if should_add == True:
            db.session.execute('insert into category_page (category_id, page_id) values ("%s","%s")'
                % (int(new_cat), page_id))

    #remove any unchecked categories
    for all_cat in site_categories:
        should_delete = True
        for new_cat in new_page_categories:
            if int(new_cat) == int(all_cat.id):
                should_delete = False

        if should_delete == True:
            category_ids_to_delete.append(int(all_cat.id))

    for dcat in category_ids_to_delete:
        db.session.execute('delete from category_page where category_id = "%s" and page_id = "%s"'
            % (int(dcat), page_id))
    
    db.session.commit()


def change_page_order():
    """ Changes the Pages' sort_order property.
    """

    order_object_array = eval(request.form['order_object_array'])
    iteration = 0

    for ob in order_object_array:
        update_page_order(ob, iteration + 1, 0)
        iteration += 1

    return 'Order changed.'


def update_page_order(ob, iteration, parent_id):
    """ Helper funciton to update the Pages' sort_order property.

        Args:
            ob: A JSON object containing the id of the page to update and its new
                order.
            iteration: The current iteration in the array of Pages.
            parent_id: The parent id of the Pages.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id=ob['id']).first()

        if ownership.check_ownership(cur_page.site_id):
            cur_page.sort_order = iteration
            cur_page.parent_id = parent_id
            db.session.commit()

            if 'children' in ob:
                iteration = 0

                for nob in ob['children']:
                    update_page_order(nob, iteration + 1, str(ob['id']))
                    iteration += 1
    else:
        return redirect('/admin/login')


def add_page_images():
    """ Adds images to a page from the image bank.
    """

    id_array_string = request.form['media_id_array']
    id_array = id_array_string.split(',')

    delete_array_string = request.form['delete_id_array']
    delete_array = delete_array_string.split(',')

    page_id = request.form['page_id']

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id=page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            cur_image_array = []
            highest_sort = 0

            for di in delete_array:
                db.session.execute('delete from page_media where page_id = "%s" and media_id = "%s"'
                                    % (page_id, str(di)))
                db.session.commit()

            cur_images = \
                db.session.execute('select * from page_media where page_id = "%s" order by sort_order'
                                    % page_id)

            for ci in cur_images:
                cur_image_array.append(ci)

                if ci.sort_order > highest_sort:
                    highest_sort = ci.sort_order

            inc = 0

            if id_array[0] != '':
                for ia in id_array:
                    inc = inc + 1
                    new_order = int(highest_sort + inc)
                    media_id = int(ia)

                    if check_image_for_duplicate(cur_image_array,
                            media_id) == False:
                        db.session.execute('insert into page_media (page_id, media_id, sort_order) values ("%s","%s","%s")'
                                 % (page_id, media_id, new_order))
                        db.session.commit()

            return 'Images added.'
    else:
        return redirect('/admin/login')


def check_image_for_duplicate(images_array, id):
    """ Checks to see if an image is already added to a page.

        Args:
            images_array: An array of the Media objects that are already added to the
                Page.
        id: The id of the Media to check.
    """

    is_duplicate = False

    for im in images_array:
        if str(im.media_id) == str(id):
            is_duplicate = True

    return is_duplicate

def check_slug_for_duplicates(new_slug, page_id = None):
    """ Checks to see if a page slug already exists.
        Args:
            new_slug: The slug of the Page the user is creating or updating.
            page_id: The slug of the Page the user is updating.
      
        Returns: Boolean whether the slug is duplicate.
    """
    
    is_duplicate = False

    all_pages = Page.query.filter_by(site_id = session['site_id'
        ]).all()

    for page in all_pages:
        if page_id is None:
            if page.slug == new_slug:
                is_duplicate = True
        else:
            if page.slug == new_slug and int(page.id) != int(page_id):
                is_duplicate = True

    return is_duplicate


def change_page_image_order():
    """ Changes the sort_order of the Media in a Page.
    """

    order_object_array = request.form.getlist('igmb[]')
    page_id = request.form['page_id']

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id=page_id).first()

        if ownership.check_ownership(cur_page.site_id):
            iteration = 0

            for ob in order_object_array:
                db.session.execute('update page_media set sort_order = "%s" where page_id = "%s" and media_id = "%s"'
                    % (int(iteration + 1), page_id,
                    str(ob)))
                db.session.commit()
                iteration += 1

        return 'order changed'
    else:
        return redirect('/admin/login')


def delete_page(page_id):
    """ Deletes a Page.
    """

    if session and session['logged_in']:
        cur_page = Page.query.filter_by(id = page_id).first()
        pages = Page.query.filter_by(site_id = session['site_id'],
            parent_id = cur_page.parent_id).order_by(Page.sort_order).all()

        if ownership.check_ownership(cur_page.site_id):
            db.session.execute('delete from page_media where page_id = "%s"'
                % str(page_id))

            for gal in pages:
                if int(gal.sort_order) > int(cur_page.sort_order):
                    gal.sort_order = int(gal.sort_order) - 1

            child_pages = Page.query.filter_by(parent_id = page_id).all()

            for cg in child_pages:
                db.session.execute('delete from page_media where page_id = "%s"'
                                    % str(cg.id))
                db.session.delete(cg)

            db.session.delete(cur_page)
            db.session.commit()

            return redirect('/admin/pages')
    else:
        return redirect('/admin/login')
