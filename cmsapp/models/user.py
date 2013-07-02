#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(80), unique = True)
    email = db.Column(db.String(120), unique = True)
    password = db.Column(db.String(120))
    is_admin = db.Column(db.Integer)
    is_master = db.Column(db.Integer)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'))
    site = db.relationship('Site', backref = db.backref('users', lazy = 'dynamic'))

    def __init__(self, username, email, password, is_admin, is_master, site_id):
        self.username = username
        self.email = email
        self.password = password
        self.is_admin = is_admin
        self.is_master = is_master
        self.site_id = site_id

    def __repr__(self):
        return '<User %r>' % self.username