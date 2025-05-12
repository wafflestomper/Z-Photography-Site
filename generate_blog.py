import os
import re
import glob
import shutil
from datetime import datetime
import markdown

# Paths
POSTS_DIR = 'blog/posts'
TEMPLATE_PATH = os.path.join(POSTS_DIR, 'post-template.html')
INDEX_PATH = 'blog/index.html'
OUTPUT_DIR = POSTS_DIR

# Helper: Parse front matter and content from markdown
FRONT_MATTER_RE = re.compile(r'^---\n([\s\S]+?)\n---\n([\s\S]*)', re.MULTILINE)

def parse_markdown(md_path):
    with open(md_path, encoding='utf-8') as f:
        content = f.read()
    match = FRONT_MATTER_RE.match(content)
    if not match:
        raise ValueError(f"No front matter found in {md_path}")
    front_matter, body = match.groups()
    meta = {}
    for line in front_matter.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            value = value.strip().strip('"')
            if value.startswith('[') and value.endswith(']'):
                # Parse list
                value = [v.strip().strip('"') for v in value[1:-1].split(',') if v.strip()]
            meta[key.strip()] = value
    return meta, body

def render_template(template, context):
    # Simple {{var}} replacement and {{#each posts}}...{{/each}}
    def replace_var(m):
        key = m.group(1)
        return str(context.get(key, ''))
    html = re.sub(r'{{(\w+)}}', replace_var, template)
    # Handle #each posts
    def each_posts(m):
        item_tpl = m.group(1)
        out = ''
        for post in context['posts']:
            out += re.sub(r'{{(\w+)}}', lambda mm: str(post.get(mm.group(1), '')), item_tpl)
        return out
    html = re.sub(r'{{#each posts}}([\s\S]+?){{/each}}', each_posts, html)
    # Handle #if olderPost/newerPost
    def if_block(m):
        var = m.group(1)
        block = m.group(2)
        if context.get(var):
            return re.sub(r'{{(\w+)}}', lambda mm: str(context[var].get(mm.group(1), '')), block)
        return ''
    html = re.sub(r'{{#if (\w+)}}([\s\S]+?){{/if}}', if_block, html)
    return html

def main():
    # Gather all markdown posts
    md_files = sorted(glob.glob(os.path.join(POSTS_DIR, '*.md')))
    posts = []
    for md_path in md_files:
        meta, body = parse_markdown(md_path)
        slug = os.path.splitext(os.path.basename(md_path))[0]
        meta['slug'] = slug
        meta['url'] = f'{slug}.html'
        meta['date_obj'] = datetime.strptime(meta['date'], '%Y-%m-%d')
        meta['content'] = markdown.markdown(body)
        posts.append(meta)
    # Sort posts by date descending
    posts.sort(key=lambda p: p['date_obj'], reverse=True)
    # Load template
    with open(TEMPLATE_PATH, encoding='utf-8') as f:
        template = f.read()
    # Generate each post
    for i, post in enumerate(posts):
        ctx = {
            'title': post['title'],
            'date': post['date'],
            'author': post.get('author', ''),
            'excerpt': post.get('excerpt', ''),
            'content': post['content'],
            'posts': [
                {'title': p['title'], 'date': p['date'], 'url': p['url']} for p in posts
            ],
            'olderPost': posts[i+1] if i+1 < len(posts) else None,
            'newerPost': posts[i-1] if i-1 >= 0 else None,
        }
        html = render_template(template, ctx)
        out_path = os.path.join(OUTPUT_DIR, f"{post['slug']}.html")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Generated {out_path}")
    # Generate index.html with most recent post
    if posts:
        most_recent = posts[0]
        ctx = {
            'title': most_recent['title'],
            'date': most_recent['date'],
            'author': most_recent.get('author', ''),
            'excerpt': most_recent.get('excerpt', ''),
            'content': most_recent['content'],
            'posts': [
                {'title': p['title'], 'date': p['date'], 'url': f'posts/{p["slug"]}.html'} for p in posts
            ],
            'olderPost': posts[1] if len(posts) > 1 else None,
            'newerPost': None,
        }
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            f.write(render_template(template, ctx))
        print(f"Generated {INDEX_PATH}")

if __name__ == '__main__':
    main() 