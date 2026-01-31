import os
import datetime

# Domain configuration
DOMAIN = 'https://apexia-labs.com'
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pages to include (Root + Tools + Privacy)
pages = [
    { 'path': '/', 'priority': '1.0' },
    { 'path': '/char-count/', 'priority': '0.8' },
    { 'path': '/garapon/', 'priority': '0.8' },
    { 'path': '/privacy/', 'priority': '0.5' }
]

def get_formatted_date():
    return datetime.date.today().isoformat()

def generate_sitemap():
    today = get_formatted_date()
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for page in pages:
        xml += '  <url>\n'
        xml += f"    <loc>{DOMAIN}{page['path']}</loc>\n"
        xml += f"    <lastmod>{today}</lastmod>\n"
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += f"    <priority>{page['priority']}</priority>\n"
        xml += '  </url>\n'

    xml += '</urlset>'

    output_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    with open(output_path, 'w') as f:
        f.write(xml)
    print(f"Sitemap generated at: {output_path}")

if __name__ == '__main__':
    generate_sitemap()
