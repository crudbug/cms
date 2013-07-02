#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class Category(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    site = db.relationship('Site', backref = db.backref('Category', lazy = 'dynamic'))
    name = db.Column(db.String(255))
    slug = db.Column(db.String())
    sort_order = db.Column(db.Integer)
    created = db.Column(db.DateTime())
    updated = db.Column(db.DateTime())

    def __init__(self, site_id, name, slug, sort_order, created, updated):
        self.site_id = site_id
        self.name = name
        self.slug = slug
        self.sort_order = sort_order
        self.created = created
        self.updated = updated

    def __repr__(self):
        return '<Category %r>' % self.title