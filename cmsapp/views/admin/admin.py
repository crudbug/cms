#!/usr/bin/python
#-*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db
from cmsapp.models.site import Site
from cmsapp.models.page import Page
from cmsapp.config import config
from cmsapp.models.user import User
from cmsapp.models.media import Media
from flask import render_template, request, url_for, redirect, flash, \
    session
from flask import escape
from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug import generate_password_hash, check_password_hash


def admin_main():
    """Shows the home view of the CMS.
    """

    if session and session['logged_in']:
        user_is_admin = session['user_is_admin']

        return render_template('admin/admin_main.html',
            user_is_admin = user_is_admin,
            site_name = config.site_name,
            powered_by_link = create_powered_by_link())
    else:
        return redirect('/admin/login')


def login():
    """Shows the login screen for the CMS.
    """

    if session and session['logged_in']:
        return redirect('/admin/main')
    else:
        return render_template('admin/admin_login.html',
            site_name = config.site_name,
            powered_by_link = create_powered_by_link())


def logout():
    """Clears the session and redirects the user to the login screen.
    """

    session.clear()

    return redirect('/admin/login')


def forgot_password():
    """Shows the forgot password view.
    """

    return render_template('admin/admin_forgot_password.html',
        site_name = config.site_name,
        powered_by_link = create_powered_by_link())


def check_user():
    """Checks to see if the username and password are valid.
    """

    username = request.form['username']
    password = request.form['password']

    password_match = False
    cur_user = User.query.filter_by(username = username).first()

    if cur_user:
        password_match = check_password_hash(cur_user.password, password)

    if password_match:
        session['user_id'] = cur_user.id
        session['username'] = cur_user.username
        session['site_id'] = cur_user.site_id
        session['user_is_admin'] = cur_user.is_admin
        session['user_is_master'] = cur_user.is_master
        session['logged_in'] = True

        return redirect('/admin/main')
    else:
        flash('Invalid Username / Password Combination', 'uu_error')

    return render_template('admin/admin_login.html',
        site_name = config.site_name,
        powered_by_link = create_powered_by_link())


def admin_images():
    """Shows the image overview admin page.
    """

    if session and session['logged_in']:
        msg = ''
        ms_class = 'media_sortable_false'
        media_count = Media.query.filter_by(site_id = session['site_id']).count()
        cur_user = User.query.filter_by(id = session['user_id'],
            site_id = session['site_id']).first()
        user_is_admin = session['user_is_admin']

        #if the option to be able to drag the media and change its order in the
        #media overview is set to true in the config file, set the class so it
        #can be added to the HTML. Then javascript code will check to see if the
        #class is there and add the functionality.
        if config.media_overview_sortable == True:
            ms_class = 'media_sortable_true'

        if request.args:
            msg = request.args['msg']

        return render_template('admin/admin_media.html',
            user_is_admin = user_is_admin,
            media_count = media_count,
            media_sortable_class = ms_class,
            site_name = config.site_name,
            msg = msg,
            powered_by_link=create_powered_by_link())
    else:
        return redirect('/admin/login')


def admin_pages():
    """Shows the image overview admin page.
    """

    if session and session['logged_in']:
        page_html = admin_create_page_html(0)
        user_is_admin = session['user_is_admin']

        return render_template('admin/admin_pages.html',
            user_is_admin = user_is_admin,
            site_name = config.site_name,
            page_html = page_html.decode('utf-8'),
            site_id = session['site_id'],
            powered_by_link = create_powered_by_link())
    else:
        return redirect('/admin/login')


def admin_create_page_html(parent_id):
    """ Creates the html for the page overview.
        Args:
            parent_id: The parent id of set of pages to get.

        Returns:
            An HTML string.
    """

    page_html = ''

    #get all pages that have the parent_id matching the parent_id passed to the
    #function

    pages = Page.query.filter_by(site_id=session['site_id'],
        parent_id=parent_id).order_by(Page.sort_order).all()
    sub_cat_array = []

    #push the pages into an array because it's easier to iterate over

    for page in pages:
        sub_cat_array.append(page)

    if len(sub_cat_array) > 0:
        ul_class = 'page_block_list'

        if parent_id == 0:
            page_html += '<ol class="sortable" id="page_block_list_'
            page_html += str(parent_id) + '">'
        else:
            page_html += \
                '<ol class="page_block_ol" id="page_block_list_'
            page_html += str(parent_id) + '">'

        for i in range(0, len(sub_cat_array)):
            page_html += '<li class="page_block_' \
                + str(sub_cat_array[i].id)
            page_html += '" id="page_block_' + str(sub_cat_array[i].id) \
                + '">'
            page_html += ' <div class="page_block_info">'
            page_html += '<div class="page_block_title">'
            page_html += '<a href="/admin/page/edit/' \
                + str(sub_cat_array[i].id)
            page_html += '">' + sub_cat_array[i].title.encode('utf-8') \
                + '</a></div>'
            page_html += '<div class="page_block_edit_btn">'
            page_html += '<a href="/admin/page/edit/' \
                + str(sub_cat_array[i].id)
            page_html += '">EDIT</a></div>'

            if sub_cat_array[i].active == 0:
                page_html += '<div class="page_block_activate_btn '
                page_html += 'page_block_activate_btn_activate">'
                page_html += '<a href="/admin/page/activate/'
                page_html += str(sub_cat_array[i].id) \
                    + '">ACTIVATE</a></div>'
            elif sub_cat_array[i].active == 1:
                page_html += '<div class="page_block_activate_btn '
                page_html += 'page_block_activate_btn_deactivate">'
                page_html += '<a href="/admin/page/deactivate/'
                page_html += str(sub_cat_array[i].id) \
                    + '">DEACTIVATE</a></div>'

            page_html += '</div>'
            page_html += admin_create_page_html(sub_cat_array[i].id)
            page_html += '</li>'
        page_html += '</ol>'

    return page_html


def create_powered_by_link():
    """ Creates the html for "powered by" links in the footer of the CMS.

        Returns:
            An HTML string.
    """

    powered_by_html = ''

    for i in range(len(config.powered_by_text)):
        powered_by_html = powered_by_html + '<a href="' \
            + config.powered_by_link[i] + '">' \
            + config.powered_by_text[i] + '</a>'

    if i < len(config.powered_by_text) - 1:
        powered_by_html = powered_by_html + ' and '

    return powered_by_html
