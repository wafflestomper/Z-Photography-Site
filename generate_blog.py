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
    # Step 1: Remove all #if blocks for variables not present in context
    def remove_if_block(m):
        var = m.group(1)
        if not context.get(var):
            return ''
        return m.group(0)  # Keep for next pass
    html = re.sub(r'[ \t]*{{#if (\w+)}}([\s\S]*?)[ \t]*{{/if}}[ \t]*\n?', remove_if_block, template)
    # Step 2: For remaining #if blocks, replace variables inside
    def process_if_block(m):
        var = m.group(1)
        block = m.group(2)
        # Replace nested variables (e.g., olderPost.url) and top-level variables (e.g., featuredImage)
        def replace_var(mm):
            key = mm.group(1)
            prefix = f'{var}.'
            if key.startswith(prefix):
                subkey = key[len(prefix):]
                return str(context[var].get(subkey, ''))
            # Top-level context variable
            return str(context.get(key, ''))
        replaced = re.sub(r'{{(\w+(?:\.\w+)?)}}', replace_var, block)
        print(f'process_if_block called for var={var}, replaced block=\n{replaced}')
        return replaced
    html = re.sub(r'[ \t]*{{#if (\w+)}}([\s\S]*?)[ \t]*{{/if}}[ \t]*\n?', process_if_block, html)
    # Handle #each posts
    def each_posts(m):
        item_tpl = m.group(1)
        out = ''
        for post in context['posts']:
            out += re.sub(r'{{(\w+)}}', lambda mm: str(post.get(mm.group(1), '')), item_tpl)
        return out
    html = re.sub(r'{{#each posts}}([\s\S]+?){{/each}}', each_posts, html)
    # Simple {{var}} replacement
    def replace_var(m):
        key = m.group(1)
        return str(context.get(key, ''))
    html = re.sub(r'{{(\w+)}}', replace_var, html)
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
        # Remove the first <h1>...</h1> from the post content to avoid duplicate titles
        content_no_title = re.sub(r'<h1[^>]*?>.*?</h1>\s*', '', post['content'], count=1, flags=re.DOTALL|re.IGNORECASE)
        ctx = {
            'title': post['title'],
            'date': post['date'],
            'dateFormatted': post['date_obj'].strftime('%B %d, %Y'),
            'author': post.get('author', ''),
            'excerpt': post.get('excerpt', ''),
            'featuredImage': post.get('featuredImage', ''),
            'imageAlt': post.get('imageAlt', post['title']),
            'content': content_no_title,
            'posts': [
                {'title': p['title'], 'date': p['date'], 'url': p['url']} for p in posts
            ],
            'olderPost': posts[i+1] if i+1 < len(posts) else None,
            'newerPost': posts[i-1] if i-1 >= 0 else None,
        }
        print('Post context:', ctx)  # Debug print
        html = render_template(template, ctx)
        out_path = os.path.join(OUTPUT_DIR, f"{post['slug']}.html")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Generated {out_path}")
    # Generate index.html with most recent post
    if posts:
        most_recent = posts[0]
        # Remove the first <h1>...</h1> from the most recent post's content for the index page
        content_no_title = re.sub(r'<h1[^>]*?>.*?</h1>\s*', '', most_recent['content'], count=1, flags=re.DOTALL|re.IGNORECASE)
        ctx = {
            'title': most_recent['title'],
            'date': most_recent['date'],
            'dateFormatted': most_recent['date_obj'].strftime('%B %d, %Y'),
            'author': most_recent.get('author', ''),
            'excerpt': most_recent.get('excerpt', ''),
            'featuredImage': most_recent.get('featuredImage', ''),
            'imageAlt': most_recent.get('imageAlt', most_recent['title']),
            'content': content_no_title,
            'posts': [
                {'title': p['title'], 'date': p['date'], 'url': p['url']} for p in posts
            ],
            'olderPost': {
                'title': posts[1]['title'],
                'url': f'posts/{posts[1]["slug"]}.html'
            } if len(posts) > 1 else None,
            # Do not set newerPost for index
        }
        print('Index context:', ctx)  # Debug print
        with open(INDEX_PATH, 'w', encoding='utf-8') as f:
            f.write(render_template(template, ctx))
        print(f"Generated {INDEX_PATH}")

if __name__ == '__main__':
    main() 