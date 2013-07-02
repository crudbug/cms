#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class CustomField(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    site = db.relationship('Site', backref = db.backref('CustomField', lazy = 'dynamic'))
    title = db.Column(db.String(255))
    value = db.Column(db.String())
    value_2 = db.Column(db.String())
    sort_order = db.Column(db.Integer)
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'))
    created = db.Column(db.DateTime())
    updated = db.Column(db.DateTime())

    def __init__(self, site_id, title, value, value_2, sort_order, page_id, created, updated):
        self.site_id = site_id
        self.title = title
        self.value = value
        self.value2 = value_2
        self.sort_order = sort_order
        self.page_id = page_id
        self.created = created
        self.updated = updated

    def __repr__(self):
        return '<CustomField %r>' % self.title