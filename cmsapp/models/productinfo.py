#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class ProductInfo(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    site = db.relationship('Site', backref = db.backref('ProductInfo', lazy='dynamic'))
    page = db.relationship('Page', backref = db.backref('ProductInfo', lazy='dynamic'))
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'))
    price = db.Column(db.String(255))
    weight = db.Column(db.String())
    quantity = db.Column(db.Integer)
    out_of_stock = db.Column(db.Integer)
    notes = db.Column(db.String())

    def __init__(self, site_id, page_id, price, weight, quantity, out_of_stock, notes):
        self.site_id = site_id
        self.page_id = page_id
        self.price = price
        self.weight = weight
        self.quantity = quantity
        self.out_of_stock = out_of_stock
        self.notes = notes

    def __repr__(self):
        return '<ProductInfo %r>' % self.id