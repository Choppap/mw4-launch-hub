import urllib.request
import xml.etree.ElementTree as ET
import json
import os
import re
from datetime import datetime
import uuid
import random

# Configuration
FEEDS = [
    {"url": "https://charlieintel.com/feed/", "name": "CharlieIntel", "credibility": "trusted"},
    {"url": "https://www.ign.com/rss/articles/feed", "name": "IGN", "credibility": "trusted"},
    {"url": "https://www.gamespot.com/feeds/news/", "name": "GameSpot", "credibility": "trusted"},
    {"url": "https://www.callofduty.com/blog/rss", "name": "Call of Duty Blog", "credibility": "official"},
    {"url": "https://blog.activision.com/feed", "name": "Activision", "credibility": "official"},
    {"url": "https://news.xbox.com/en-us/feed/", "name": "Xbox Wire", "credibility": "official"},
    {"url": "https://www.windowscentral.com/rss", "name": "Windows Central", "credibility": "trusted"},
    {"url": "https://www.techradar.com/rss", "name": "TechRadar", "credibility": "trusted"},
    {"url": "https://www.theguardian.com/games/rss", "name": "The Guardian", "credibility": "trusted"}
]

KEYWORDS = ["MW4", "Modern Warfare 4", "Modern Warfare IV", "Call of Duty 2026", "CoD 2026"]

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.json')

def clean_html(raw_html):
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def scrape_feeds():
    print(f"[{datetime.now().isoformat()}] Starting news scrape...")
    
    # Load existing articles to avoid duplicates
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            try:
                data = json.load(f)
                existing_articles = data.get("articles", [])
                existing_titles = {a["title"] for a in existing_articles}
            except json.JSONDecodeError:
                existing_articles = []
                existing_titles = set()
    else:
        existing_articles = []
        existing_titles = set()
        
    new_articles = []
    
    for feed in FEEDS:
        print(f"Fetching {feed['name']}...")
        try:
            import ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(feed['url'], headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
            with urllib.request.urlopen(req, context=ctx) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)
                
                # Basic RSS 2.0 parsing
                for item in root.findall('.//item'):
                    title_el = item.find('title')
                    desc_el = item.find('description')
                    link_el = item.find('link')
                    pub_date_el = item.find('pubDate')
                    
                    if title_el is None or link_el is None:
                        continue
                        
                    title = title_el.text
                    
                    # Check if relevant
                    if any(keyword.lower() in title.lower() for keyword in KEYWORDS):
                        if title in existing_titles:
                            continue
                            
                        desc = clean_html(desc_el.text) if desc_el is not None else ""
                        
                        # Extract image from RSS/Atom/HTML
                        image_url = None
                        
                        # Try media:content
                        media_content = item.find('{http://search.yahoo.com/mrss/}content')
                        if media_content is not None and 'url' in media_content.attrib:
                            image_url = media_content.attrib['url']
                        
                        # Try enclosure
                        if not image_url:
                            enclosure = item.find('enclosure')
                            if enclosure is not None and 'url' in enclosure.attrib and 'image' in enclosure.attrib.get('type', ''):
                                image_url = enclosure.attrib['url']
                                
                        # Try parsing from description HTML
                        if not image_url and desc_el is not None and desc_el.text:
                            img_match = re.search(r'<img[^>]+src="([^">]+)"', desc_el.text)
                            if img_match:
                                image_url = img_match.group(1)
                                
                        # Use a fallback image if none found, we will inject a clean placeholder path
                        if not image_url:
                            image_url = f"assets/images/mw4_placeholder_{random.randint(1, 3)}.png"
                            
                        pub_date = pub_date_el.text if pub_date_el is not None else datetime.now().isoformat()
                        
                        article = {
                            "id": f"scraped-{uuid.uuid4().hex[:8]}",
                            "title": title,
                            "summary": desc[:250] + "..." if len(desc) > 250 else desc,
                            "imageUrl": image_url,
                            "sourceUrl": link_el.text,
                            "source": {
                                "name": feed['name'],
                                "credibility": feed['credibility']
                            },
                            "publishedAt": pub_date,
                            "classification": "rumour",
                            "confidence": "medium",
                            "pinned": False,
                            "featured": False,
                            "confirmed": False,
                            "debunked": False
                        }
                        
                        new_articles.append(article)
                        existing_titles.add(title)
                        print(f"Found new article: {title}")
                        
        except Exception as e:
            print(f"Error scraping {feed['name']}: {e}")
            
    if new_articles:
        # Prepend new articles
        all_articles = new_articles + existing_articles
        # Keep only top 50
        all_articles = all_articles[:50]
        
        with open(DATA_FILE, 'w') as f:
            json.dump({"articles": all_articles}, f, indent=2)
        print(f"[{datetime.now().isoformat()}] Added {len(new_articles)} new articles. Total: {len(all_articles)}")
    else:
        print(f"[{datetime.now().isoformat()}] No new articles found.")

if __name__ == "__main__":
    scrape_feeds()