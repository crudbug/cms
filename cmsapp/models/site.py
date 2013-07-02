#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = 'Mike Fey (mike@mikefey.com)'
__license__ = 'MIT License'
__version__ = '0.1'

from cmsapp import db

class Site(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(80), unique = True)
    url = db.Column(db.String())

    def __init__(self, name, url):
        self.name = name
        self.url = url
    
    def __repr__(self):
        return '<Site %r>' % self.name