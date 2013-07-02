#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db
from cmsapp.config import config
from cmsapp.models.site import Site
from cmsapp.models.user import User
from cmsapp.views.admin import admin
from cmsapp.helpers import ownership
from flask import render_template, request, url_for, redirect, flash, \
    session
from flask import escape
from flask.ext.sqlalchemy import SQLAlchemy
from werkzeug import generate_password_hash, check_password_hash


def edit_user(user_id):
    """Shows the User edit view.

  Args:
    username: The username of the User to edit.
  """

    if session and session['logged_in']:
        cur_user = User.query.filter_by(id = user_id).first()
        user_is_admin = session['user_is_admin']
        editing_self = False

        if cur_user.username == session['username']:
            editing_self = True
        check_admin = ''

        if cur_user.is_admin == 1:
            check_admin = 'checked'

        return render_template(
            'admin/admin_user_edit.html',
            user_is_admin = user_is_admin,
            site_name = config.site_name,
            cur_user = cur_user,
            check_admin = check_admin,
            editing_self = editing_self,
            powered_by_link = admin.create_powered_by_link())
    else:
        return redirect('/admin/login')


def send_password():
    """Gets a user's password by an email address and sends it to that email
      address.
  """

    user_email = request.form['email']
    cur_user = User.query.filter_by(email = user_email).first()


def update_user():
    """Updates a User.
  """

    user_id = request.form['user_id']
    cur_user = User.query.filter_by(id = user_id).first()

    if session['logged_in'] and (ownership.check_ownership(user_id) or session['user_is_admin']):
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        password_check = request.form['password_check']
        user_is_admin = session['user_is_admin']
        check_admin = ''
        updating_user_is_admin = 0
        flash_message = ''
        flash_class = ''

        if 'is_admin' not in request.form and cur_user.is_master == 0 \
            and cur_user.id != session['user_id']:
            check_admin = ''
        else:
            check_admin = 'checked'
            updating_user_is_admin = 1

        if len(email) == 0:
            flash_message = 'Error: Please provide an email address.'
            flash_class = 'uu_error'
        elif len(username) == 0:
            flash_message = 'Error: Please provide a username.'
            flash_class = 'uu_error'
        elif str(password) != str(password_check):
            flash_message = 'Error: Passwords do not match.'
            flash_class = 'uu_error'
        elif len(str(password)) < 7:
            flash_message = \
                'Error: Password must be at least 7 characters in length.'
            flash_class = 'uu_error'
        else:
            cur_user.username = username
            cur_user.email = email

            if cur_user.is_master == 0 and cur_user.id \
                != session['user_id']:
                cur_user.is_admin = updating_user_is_admin

            if len(password) > 0 and str(password) \
                == str(password_check):
                cur_user.password = generate_password_hash(password)

            db.session.commit()
            flash_message = 'User successfully updated.'
            flash_class = 'uu_success'

        flash(flash_message, flash_class)

        return render_template(
            'admin/admin_user_edit.html',
            site_name = config.site_name,
            check_admin = check_admin,
            user_is_admin = user_is_admin,
            updating_user_is_admin = updating_user_is_admin,
            cur_user = cur_user,
            powered_by_link = admin.create_powered_by_link())
    else:

        return redirect('/admin/login')


def manage_users():
    """Manages users.
  """

    if session and session['logged_in'] and session['user_is_admin'] == 1:
        all_users = User.query.filter_by(site_id = 1).all()
        user_id = session['user_id']
        user_is_admin = session['user_is_admin']
        cur_user = User.query.filter_by(id = user_id).first()

        return render_template(
            'admin/admin_users.html',
            site_name = config.site_name,
            user_is_admin = user_is_admin,
            cur_user = cur_user,
            all_users = all_users,
            powered_by_link = admin.create_powered_by_link())


def new_user():
    """Shows the Add User view.
  """

    user_is_admin = session['user_is_admin']
    user_id = session['user_id']
    user_is_admin = session['user_is_admin']
    cur_user = User.query.filter_by(id = user_id).first()

    return render_template('admin/admin_user_add.html',
        site_name = config.site_name,
        user_is_admin = user_is_admin,
        powered_by_link = admin.create_powered_by_link())


def add_user():
    """Creates a User.
  """

    if session['logged_in'] and session['user_is_admin']:
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        password_check = request.form['password_check']
        user_is_admin = session['user_is_admin']
        check_admin = ''
        new_user_is_admin = 0
        flash_message = ''
        flash_class = ''
        error_creating_user = False

        if 'is_admin' not in request.form:
            check_admin = ''
        else:
            check_admin = 'checked'
            new_user_is_admin = 1

        if len(email) == 0:
            flash_message = 'Error: Please provide an email address.'
            flash_class = 'uu_error'
            error_creating_user = True
        elif len(username) == 0:
            flash_message = 'Error: Please provide a username.'
            flash_class = 'uu_error'
            error_creating_user = True
        elif str(password) != str(password_check):
            flash_message = 'Error: Passwords do not match.'
            flash_class = 'uu_error'
            error_creating_user = True
        elif len(str(password)) < 7:
            flash_message = \
                'Error: Password must be at least 7 characters in length.'
            flash_class = 'uu_error'
            error_creating_user = True
        else:
            new_user = User(
                username,
                email,
                generate_password_hash(password),
                new_user_is_admin,
                0,
                1)

            db.session.add(new_user)
            db.session.commit()

            flash('User successfully created.', 'uu_success')

            return redirect('admin/user/edit/' + str(new_user.id))

        if error_creating_user == True:
            flash(flash_message, flash_class)

            return render_template(
                'admin/admin_user_add.html',
                site_name = config.site_name,
                check_admin = check_admin,
                user_is_admin = user_is_admin,
                updating_user_is_admin = new_user_is_admin,
                powered_by_link = admin.create_powered_by_link())
    else:
        return redirect('/admin/login')


def delete_user(user_id):
    """Deletes a User.
  """

    user_is_admin = session['user_is_admin']

    if session['logged_in'] and user_is_admin == 1:
        cur_user = User.query.filter_by(id = user_id).first()

        if cur_user.is_master == 0 and cur_user.id != session['user_id'
                ]:
            db.session.delete(cur_user)
            db.session.commit()

            return redirect('/admin/user/manage')
        else:
            flash('Error: You cannot delete this user.', 'uu_error')

            return redirect('admin/user/edit/' + cur_user.username)
