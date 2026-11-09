# Generates docs/settings-reference.md from the {% schema %} block of every
# custom section. Regenerate after changing any schema.
import json, re, glob, io, datetime, os


def esc(s):
    return str(s).replace('|', '\\|').replace('\n', ' ')


def fmt_default(x):
    if 'default' not in x:
        return ''
    d = x['default']
    if isinstance(d, bool):
        return '`%s`' % ('on' if d else 'off')
    s = str(d)
    if s == '':
        return '*(empty)*'
    if len(s) > 46:
        s = s[:44] + '...'
    return '`%s`' % esc(s)


def fmt_type(x):
    t = x.get('type', '')
    if x.get('options'):
        return '%s<br><small>%s</small>' % (
            t, ' / '.join('`%s`' % o.get('value') for o in x['options']))
    if x.get('min') is not None:
        return '%s<br><small>%s-%s</small>' % (t, x['min'], x.get('max'))
    return t


def norm(path):
    return path.replace(os.sep, '/')


rows = []
A = rows.append

A('# Settings reference')
A('')
A('Every setting and every block on all 25 custom sections, taken straight from')
A('the `{% schema %}` blocks in the code.')
A('')
A('**Generated file - do not hand-edit.** Regenerate it after changing a schema;')
A('the command is at the bottom. Because it is read from the code it cannot drift,')
A('which is the whole point of keeping it separate from the prose.')
A('')
A('| Looking for | Read |')
A('|---|---|')
A('| How a system works, and recipes | `system-reference.md` |')
A('| Traps that have cost time before | `theme-notes.md` |')
A('| Running the shop day to day | `merchant-guide.md` |')
A('| Why a change was made | `git log --grep=` |')
A('')
A('Generated %s.' % datetime.date.today().isoformat())
A('')

files = sorted(glob.glob('sections/ab*.liquid'))
meta = []
for path in files:
    src = io.open(path, encoding='utf-8').read()
    m = re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}', src, re.S)
    if not m:
        continue
    try:
        s = json.loads(m.group(1))
    except Exception:
        continue
    name = s.get('name', path)
    anchor = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    meta.append((path, s, name, anchor))

A('## Contents')
A('')
for path, s, name, anchor in meta:
    A('- [%s](#%s) - `%s`' % (name, anchor, norm(path)))
A('')


def table(settings, title=None):
    real = [x for x in settings if x.get('type') not in ('header', 'paragraph')]
    notes = [x for x in settings if x.get('type') in ('header', 'paragraph')]
    if title:
        A('**%s**' % title)
        A('')
    if not real:
        A('*No settings.*')
        A('')
    else:
        A('| Setting id | Type | Label | Default | Notes |')
        A('|---|---|---|---|---|')
        for x in real:
            A('| `%s` | %s | %s | %s | %s |' % (
                x.get('id', '?'), fmt_type(x), esc(x.get('label', '')),
                fmt_default(x), esc(x.get('info', ''))))
        A('')
    if notes:
        A('<details><summary>Guidance text shown in the theme editor</summary>')
        A('')
        for n in notes:
            A('- **%s:** %s' % (n.get('type'), esc(n.get('content', ''))))
        A('')
        A('</details>')
        A('')


for path, s, name, anchor in meta:
    A('---')
    A('')
    A('## %s' % name)
    A('')
    A('`%s`' % norm(path))
    A('')
    if s.get('enabled_on'):
        on = s['enabled_on']
        where = on.get('templates') or on.get('groups') or []
        A('- Only available on: **%s**' % ', '.join('`%s`' % w for w in where))
    else:
        A('- Available on any template')
    A('- Preset in the "Add section" menu: **%s**'
      % ('yes' if s.get('presets') else 'no - it can only be added where it already is'))
    if s.get('max_blocks'):
        A('- Maximum blocks: **%s**' % s['max_blocks'])
    A('')
    table(s.get('settings', []))
    for b in s.get('blocks', []):
        lim = b.get('limit')
        head = 'Block: %s  (`type: %s`%s)' % (
            b.get('name'), b.get('type'), ', limit %s' % lim if lim else '')
        table(b.get('settings', []), head)

A('---')
A('')
A('## Regenerating')
A('')
A('```bash')
A('python3 -I scripts/gen-settings-reference.py')
A('```')
A('')
A('Reads the `{% schema %}` block of every `sections/ab*.liquid` and overwrites')
A('this file. `scripts/` is not a Shopify theme directory, so the CLI never')
A('uploads it, and `.theme-check.yml` does not need to ignore it.')
A('')

io.open('docs/settings-reference.md', 'w', encoding='utf-8', newline='\n').write('\n'.join(rows))
print('wrote docs/settings-reference.md: %d lines, %d sections' % (len(rows), len(meta)))
