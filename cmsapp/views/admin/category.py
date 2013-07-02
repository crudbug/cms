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

def admin_categories():
    """ Shows the create category view.
    """

    if session and session['logged_in']:

    	user_is_admin = session['user_is_admin']
    	site_categories = Category.query.filter_by(site_id = session['site_id']).order_by(Category.sort_order).all()
    	category_count = len(site_categories)

        return render_template(
			'admin/admin_categories.html',
			user_is_admin = user_is_admin,
			site_name = config.site_name,
			site_categories = site_categories,
			category_count = category_count,
			powered_by_link = admin.create_powered_by_link())
    else:
        return redirect('/admin/login')


def add_category():
    """ Adds a category.
    """

    if session and session['logged_in']:
        site_categories = Category.query.filter_by(site_id = session['site_id']).all()

    	category_name = request.form['category_name']
    	category_slug = request.form['category_slug']
    	highest_sort_order = 0

    	for cat in site_categories:
    		if int(cat.sort_order) > highest_sort_order:
    			highest_sort_order = int(cat.sort_order) + 1

        if highest_sort_order == 0:
            highest_sort_order = 1

        if not category_name:
        	flash('The category must have a name.', 'uu_error')
        elif not category_slug:
        	flash('The category must have a slug.', 'uu_error')
    	elif check_for_duplicate_names_and_slugs(category_name, category_slug) == True:
    		flash('The category name and slug must be unique. Another category has that name or slug.', 'uu_error')
        else:
            category_slug = category_slug.replace(' ', '-')
            category_slug = category_slug.replace('/', '')
            category_slug = urllib.quote(category_slug)
            category_slug = category_slug.lower()
            now = datetime.datetime.now()

            new_category = Category(
                session['site_id'],
                category_name,
                category_slug,
                highest_sort_order,
                now,
                now)

            db.session.add(new_category)
            db.session.commit()

            flash('Category successfully created.', 'uu_success')

        return redirect('/admin/categories')
    else:
        return redirect('/admin/login')


def check_for_duplicate_names_and_slugs(name, slug):
	is_duplicate = False
	site_categories = Category.query.filter_by(site_id = session['site_id']).all()

	for cat in site_categories:
		if cat.slug == slug or cat.name == name:
			is_duplicate = True

	return is_duplicate


def change_category_order():
    """ Changes the sort_order of a Category.
    """

    order_array = []
    order_array_string = request.form['id_array'].split(',')
    for oas in order_array_string:
        order_id = str(oas)[2:]
        order_id = int(order_id)
        order_array.append(order_id)

    iteration = 0

    if session and session['logged_in']:
        for ob in order_array:
            cur_category = Category.query.filter_by(id = ob).first()
            if ownership.check_ownership(cur_category.site_id):
                cur_category.sort_order = iteration + 1
                db.session.commit()
                iteration = iteration + 1

        return 'order changed'
    else:
        return redirect('/admin/login')


def delete_category(category_id):
    """ Deletes a category.
    """
    
    if session and session['logged_in']:

    	user_is_admin = session['user_is_admin']
    	site_categories = Category.query.filter_by(site_id = session['site_id']).all()
    	category_to_delete = Category.query.filter_by(id = category_id).first()

    	if ownership.check_ownership(category_to_delete.site_id):
            db.session.delete(category_to_delete)
            db.session.execute('delete from category_page where category_id = "%s"'
                % str(category_id))

            for cat in site_categories:
                if int(cat.sort_order) > int(category_to_delete.sort_order):
                    cat.sort_order = int(cat.sort_order) - 1

            db.session.commit()

        return redirect('/admin/categories')
    else:
        return redirect('/admin/login')

