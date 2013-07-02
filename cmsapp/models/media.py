#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class Media(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    site = db.relationship('Site', backref = db.backref('media', lazy = 'dynamic'))
    filename = db.Column(db.String())
    file_url = db.Column(db.String())
    file_type = db.Column(db.String(120))
    file_width = db.Column(db.Integer)
    file_height = db.Column(db.Integer)
    video_embed_code = db.Column(db.String())
    tags = db.Column(db.String())
    caption = db.Column(db.String())
    description = db.Column(db.String())
    created = db.Column(db.DateTime())
    updated = db.Column(db.DateTime())
    sort_order = db.Column(db.Integer)

    def __init__(self, site_id, filename, file_url, file_type, file_width, file_height, tags, caption, description, video_embed_code, created, updated, sort_order):
        self.site_id = site_id
        self.filename = filename
        self.file_url = file_url
        self.file_type = file_type
        self.file_width = file_width
        self.file_height = file_height
        self.tags = tags
        self.caption = caption
        self.description = description
        self.video_embed_code = video_embed_code
        self.created = created
        self.updated = updated
        self.sort_order = sort_order

    def __repr__(self):
        return '<Media %r>' % self.filename