#!/usr/bin/env python

"""Converts from Chrome's HAR log format to a shortened TSV.

Used for determining services hit during Santa requests. Reads the
x-google-service response header.

Usage:
./convert-har.py < src.json > out.tsv
"""

import sys
import json
import time
import datetime

data = json.loads(sys.stdin.read())

entries = data['log']['entries']

def responseHeader(e, name):
    for header in e['response']['headers']:
        if header['name'].lower() == name.lower():
            return header['value']
    return ''

startTime = None  # store so delta from first request can be printed

for e in entries:
    st = time.strptime(e['startedDateTime'], '%Y-%m-%dT%H:%M:%S.%fZ')
    now = time.mktime(st)

    if startTime is None:
        startTime = now

    now = int(now - startTime) 
    delta = datetime.timedelta(seconds=now)

    parts = [e['startedDateTime'], delta, e['request']['url'], responseHeader(e, 'x-google-service'), 1]
    print('\t'.join([str(p) for p in parts]))
