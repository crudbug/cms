#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class Page(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    site = db.relationship('Site', backref = db.backref('page', lazy = 'dynamic'))
    title = db.Column(db.String(255))
    slug = db.Column(db.String())
    description = db.Column(db.String())
    sort_order = db.Column(db.Integer)
    active = db.Column(db.Integer)
    parent_id = db.Column(db.Integer, db.ForeignKey('page.id'))
    created = db.Column(db.DateTime())
    updated = db.Column(db.DateTime())
    is_product = db.Column(db.Integer)

    def __init__(self, site_id, title, slug, description, sort_order, active, parent_id, created, updated, is_product):
        self.site_id = site_id
        self.title = title
        self.slug = slug
        self.description = description
        self.sort_order = sort_order
        self.active = active
        self.parent_id = parent_id
        self.created = created
        self.updated = updated
        self.is_product = is_product

    def __repr__(self):
        return '<Page %r>' % self.title