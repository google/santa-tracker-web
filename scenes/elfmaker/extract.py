#!/usr/bin/env python

import re
import sys
import os

x = re.compile('/title>(.+)<')
root = sys.argv[1]
files = os.listdir(root)
files.sort()
for fp in files:
    with open(root + '/' + fp) as f:
        raw = f.read()
        y = x.search(raw)
        match = y and y.group(1) or ''
        if not match:
            continue
        print("""  svg`
{}
`,  // {}""".format(match, fp))

