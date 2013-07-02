#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

import os
import time
import datetime
import simplejson
import Image
import urllib
import cStringIO
from cmsapp import db
from cmsapp import app
from cmsapp.config import config
from cmsapp.models.site import Site
from cmsapp.models.media import Media
from cmsapp.models.user import User
from cmsapp.views.admin import admin
from cmsapp.helpers import ownership
from flask import render_template, request, url_for, redirect, flash, \
    session
from flask import escape
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import func
from werkzeug import generate_password_hash, check_password_hash
from werkzeug import secure_filename


def upload_media():
    """ Takes an uploaded image, creates an Image model and inserts it into the
        database, and creates a thumbnail image with the same filename + '_thumb', as
        well as a medium size thumbnail image with the same filename + '_medium'. 
    """

    if session and session['logged_in']:
        cur_user = User.query.filter_by(id=session['user_id']).first()

        if request.method == 'GET':
            return 'image upload'

        if request.method == 'POST':
            is_update = 0
            update_id = None
            cur_image = None

            # if there are variables in the url, then the image is being updated.
            if request.args:
                is_update = request.args['u']
                update_id = request.args['id']

            # delete current image if updating
            if is_update != 0:
                cur_image = Media.query.filter_by(id = update_id).first()
                tp = str(os.path.splitext(cur_image.file_url)[0])
                tx = str(os.path.splitext(cur_image.file_url)[1])
                delete_thumb_path = tp + '_thumb' + tx
                delete_medium_thumb_path = tp + '_medium' + tx
                os.remove(delete_thumb_path)
                os.remove(delete_medium_thumb_path)
                os.remove(cur_image.file_url)

            file = request.files['files[]']

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                just_name = str(os.path.splitext(filename)[0])
                just_ext = str(os.path.splitext(filename)[1])
                now = datetime.datetime.now()
                date_str = now.strftime('%Y-%m-%d-%H-%M-%S')
                current_time = str(date_str)
                new_filename = just_name + current_time + just_ext
                new_file_path = os.path.join(app.config['UPLOAD_FOLDER'
                    ], new_filename)
                file.save(new_file_path)

                img = Image.open(new_file_path)
                img_size = os.path.getsize(new_file_path)
                img_width = str(img.size[0])
                img_height = str(img.size[1])

                # if not updating, find the highest sort_order and increment it by one
                # to use as the sort_order for the new Image.
                if is_update == 0:
                    highest_sort = \
                        db.session.query(func.max(Media.sort_order)).first()

                    if highest_sort[0] != None:
                        new_sort_order = highest_sort[0] + 1
                    else:
                        new_sort_order = 1

                    new_media = Media(
                        session['site_id'],
                        new_filename,
                        new_file_path,
                        just_ext.lower(),
                        img_width,
                        img_height,
                        '',
                        '',
                        '',
                        '',
                        now,
                        now,
                        new_sort_order)

                    db.session.add(new_media)
                else:
                    cur_image.filename = new_filename
                    cur_image.file_url = new_file_path
                    cur_image.file_type = just_ext.lower()
                    cur_image.file_width = img_width
                    cur_image.file_height = img_height
                    cur_image.updated = now

                db.session.commit()

                generate_and_save_thumbnail(
                    new_file_path,
                    just_name + current_time,
                    just_ext,
                    config.thumbnail_width,
                    config.thumbnail_height,
                    '_thumb')

                generate_and_save_thumbnail(
                    new_file_path,
                    just_name + current_time,
                    just_ext,
                    config.medium_thumbnail_width,
                    config.medium_thumbnail_height,
                    '_medium')

                return simplejson.dumps('success')
    else:
        return redirect('/admin/login')


def allowed_file(filename):
    """ Checks to see if the file the user is uploading is an allowed format.
        Args:
            filename: The filename string.

        Returns:
            True if the file is allowed.
    """

    return '.' in filename.lower() and filename.lower().rsplit('.',
        1)[1] in app.config['ALLOWED_EXTENSIONS']


def generate_and_save_thumbnail(
    file,
    filename,
    ext,
    width,
    height,
    label,
    ):
    """ Creates a thumbnail from an image and resizes it, keeping the aspect
            ratio.
        Args:
            file: A file image object.
            filename: The filename without the extension.
            ext: The file extension.
            width: The desired maximim width of the thumbnail.
            height: The desired maximim height of the thumbnail.
            label: The string to append to the filename (i.e. '_thumb').
    """

    image = Image.open(file)
    icc_profile = image.info.get('icc_profile')

    image.thumbnail((width, height), Image.ANTIALIAS)
    new_filename = filename + label + ext
    image.save(os.path.join(app.config['UPLOAD_FOLDER'], new_filename),
        'JPEG', icc_profile = icc_profile, quality = 100)


def crop_and_save_image():
    """ Crops an image.
    """

    if session and session['logged_in']:
        file_path = request.form['filepath']
        file_new_width = int(request.form['filewidth'])
        file_new_height = int(request.form['fileheight'])
        file_top = int(request.form['filetop'])
        file_left = int(request.form['fileleft'])
        original_file_width = int(request.form['fileoriginalwidth'])
        original_file_height = int(request.form['fileoriginalheight'])

        just_file = str(os.path.split(file_path)[1])
        just_name = str(os.path.splitext(just_file)[0])
        just_ext = str(os.path.splitext(just_file)[1])
        new_filename = just_name + '_thumb' + just_ext

        image_resize_proportion = file_new_width * 3 \
            / original_file_width
        new_x_pos = file_left * 3
        new_y_pos = file_top * 3

        image = Image.open(os.path.join(app.config['UPLOAD_FOLDER'],
            just_file))
        icc_profile = image.info.get('icc_profile')
        resized_image = image.resize((file_new_width * 3, file_new_height
            * 3), Image.ANTIALIAS)
        box = (new_x_pos, new_y_pos, new_x_pos
            + config.thumbnail_width, new_y_pos
            + config.thumbnail_height)
        cropped_image = resized_image.crop(box)
        cropped_image.save(os.path.join(app.config['UPLOAD_FOLDER'],
            new_filename), 'JPEG', icc_profile = icc_profile, quality = 100)

        return 'success'


def get_all_json():
    """ Gets all Media objects from the database.
    
        Returns:
            An array of JSON Media objects.
    """

    if session and session['logged_in']:
        cur_user = User.query.filter_by(id=session['user_id']).first()
        all_media_array = []
        all_media = Media.query.filter_by(site_id=session['site_id'
                ]).order_by(Media.sort_order).all()
        thumb_target_height = 100

        for m in all_media:
            mob = {}
            mob['id'] = m.id
            mob['filename'] = m.filename
            mob['file_url'] = m.file_url
            mob['file_type'] = m.file_type
            mob['file_width'] = m.file_width
            mob['file_height'] = m.file_height
            mob['thumb_width'] = float(thumb_target_height) \
                / float(m.file_height) * float(m.file_width)
            mob['thumb_height'] = thumb_target_height
            mob['tags'] = m.tags
            mob['caption'] = m.caption
            mob['description'] = m.description
            mob['sort_order'] = m.sort_order
            mob['created'] = str(m.created)
            mob['updated'] = str(m.updated)

            all_media_array.append(mob)

        return simplejson.dumps(all_media_array)
    else:

        return redirect('/admin/login')


def get_by_id_json(media_id):
    """ Gets a Media object from the database by its id.

        Args: 
            media_id: The id of the Media object to get.
        Returns:
            A JSON Media object.
    """

    if session and session['logged_in']:
        cur_image = Media.query.filter_by(id=media_id).first()

        if ownership.check_ownership(cur_image.site_id):
            mob = {}
            mob['id'] = cur_image.id
            mob['filename'] = cur_image.filename
            mob['file_url'] = cur_image.file_url
            mob['file_type'] = cur_image.file_type
            mob['file_width'] = cur_image.file_width
            mob['file_height'] = cur_image.file_height
            mob['tags'] = cur_image.tags
            mob['caption'] = cur_image.caption
            mob['description'] = cur_image.description
            mob['created'] = \
                str(cur_image.created.strftime('%m%/%d/%Y %I:%M:%S %p'))
            mob['updated'] = \
                str(cur_image.updated.strftime('%m%/%d/%Y %I:%M:%S %p'))

            return simplejson.dumps(mob)
        else:
            return 'You do not have permission to perform this operation.'
    else:
        return redirect('/admin/login')


def edit_media(media_id, page_id = -1):
    """ Shows the view to edit a single Media object.

        Args: 
            media_id: The id of the Media object to get.
            page_id: The id of the page, if the user clicked this image from the
                Page edit view. If not, it is set to -1.
    """

    if session and session['logged_in']:
        cur_image = {}
        next_image = {}
        prev_image = {}
        all_media = {}
        all_media_array = []
        in_page = False

        # if the user has clicked a media to edit from the "manage media" page,
        # get all of the media
        if page_id == -1:
            all_media = Media.query.filter_by(site_id=session['site_id'
                    ]).order_by(Media.sort_order).all()

            for am in all_media:
                all_media_array.append(am)
        else:

            # if the user has clicked a media to edit from a page,
            # get only the media attached to that page
            in_page = True
            page_images = \
                db.session.execute('select * from page_media where page_id = "%s" order by sort_order'
                                    % page_id)
            for gi in page_images:
                cur_image = \
                    Media.query.filter_by(id=gi.media_id).first()
                all_media_array.append(cur_image)

        print all_media_array

        for i in range(len(all_media_array)):
            if int(all_media_array[i].id) == int(media_id):
                cur_image = all_media_array[i]

                # set the previous and next images to set proper urls for the
                # previous and next image buttons
                if int(i) - 1 < 0:
                    prev_image = all_media_array[len(all_media_array)
                            - 1]
                else:
                    prev_image = all_media_array[int(i) - 1]

                if int(i) + 1 > len(all_media_array) - 1:
                    next_image = all_media_array[0]
                else:
                    next_image = all_media_array[int(i) + 1]

        if ownership.check_ownership(cur_image.site_id):
            cur_user = User.query.filter_by(id=session['user_id'
                    ]).first()
            user_is_admin = session['user_is_admin']

            if cur_user.site_id == cur_image.site_id:
                return render_template(
                    'admin/admin_media_edit.html',
                    user_is_admin = user_is_admin,
                    editable_thumbnails = config.editable_thumbnails,
                    page_id = page_id,
                    in_page = in_page,
                    cur_image = cur_image,
                    prev_image = prev_image,
                    next_image = next_image,
                    site_name = config.site_name,
                    just_updated = False,
                    powered_by_link = admin.create_powered_by_link())
            else:
                return redirect('/admin/login')
    else:
        return redirect('/admin/login')


def update_media(media_id):
    """ Updates a Media object.

        Args: 
            media_id: The id of the Media object to update.
    """

    if session and session['logged_in']:

        cur_image = {}
        next_image = {}
        prev_image = {}

        all_media = Media.query.filter_by(site_id = session['site_id'
                ]).all()
        all_media_array = []

        for am in all_media:
            all_media_array.append(am)

        for i in range(len(all_media_array)):
            if int(all_media_array[i].id) == int(media_id):
                cur_image = all_media_array[i]

                if i - 1 < 0:
                    prev_image = all_media_array[len(all_media_array) - 1]
                else:
                    prev_image = all_media_array[i - 1]

                if i + 1 > len(all_media_array) - 1:
                    next_image = all_media_array[0]
                else:
                    next_image = all_media_array[i + 1]

        if ownership.check_ownership(cur_image.site_id):
            now = datetime.datetime.now()

            cur_image.caption = request.form['caption']
            cur_image.description = request.form['description']
            cur_image.video_embed_code = request.form['video_embed']
            cur_image.updated = now
            cur_image.tags = request.form['tags']

            flash('Media successfully updated.', 'uu_success')

            db.session.commit()
            
            return redirect('/admin/media/edit/' + str(cur_image.id) + '#editinginfo')
        else:
            return redirect('/admin/login')
    else:
        return redirect('/admin/login')


def change_media_order():
    """ Changes the sort_order of a Media object.
    """

    order_object_array = request.form.getlist('mb[]')
    iteration = 0

    if session and session['logged_in']:
        for ob in order_object_array:
            cur_media = Media.query.filter_by(id=ob).first()
            if ownership.check_ownership(cur_media.site_id):
                cur_media.sort_order = iteration + 1
                db.session.commit()
                iteration = iteration + 1

        return 'order changed'
    else:
        return redirect('/admin/login')


def delete_media(media_id):
    """ Deletes a Media object.
    """

    if session and session['logged_in']:
        cur_image = Media.query.filter_by(id=media_id).first()
        all_media = Media.query.filter_by(site_id=session['site_id'
                ]).all()

        if ownership.check_ownership(cur_image.site_id):
            tp = str(os.path.splitext(cur_image.file_url)[0])
            tx = str(os.path.splitext(cur_image.file_url)[1])
            delete_thumb_path = tp + '_thumb' + tx
            delete_medium_path = tp + '_medium' + tx
            os.remove(delete_thumb_path)
            os.remove(delete_medium_path)
            os.remove(cur_image.file_url)

            for am in all_media:
                if int(am.sort_order) > cur_image.sort_order:
                    am.sort_order = int(am.sort_order) - 1

            db.session.delete(cur_image)
            images_to_delete = \
                db.session.execute('select * from page_media where media_id = "%s" order by sort_order'
                                    % media_id)

            for itd in images_to_delete:
                cur_sort_order = itd.sort_order
                images_in_del_gal = \
                    db.session.execute('select * from page_media where page_id = "%s" order by sort_order'
                         % itd.page_id)

                for dim in images_in_del_gal:
                    if dim.sort_order > cur_sort_order:
                        og_sort_order = dim.sort_order
                        db.session.execute('update page_media set sort_order = "%s" where id = "%s"'
                                 % (og_sort_order - 1, dim.id))

            db.session.execute('delete from page_media where media_id = "%s"'
                                % str(media_id))
            db.session.commit()

            return redirect('/admin/media')
        else:
            return redirect('/admin/login')
    else:
        return redirect('/admin/login')
