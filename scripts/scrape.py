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
    {"url": "https://www.gamespot.com/feeds/news/", "name": "GameSpot", "credibility": "trusted"}
]

KEYWORDS = ["MW4", "Modern Warfare 4", "Modern Warfare IV"]

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.json')

PLACEHOLDER_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/en/1/1d/Call_of_Duty_Modern_Warfare_III_key_art.jpg",
    "https://upload.wikimedia.org/wikipedia/en/b/b2/Call_of_Duty_Modern_Warfare_II_Key_Art.jpg",
    "https://upload.wikimedia.org/wikipedia/en/e/e9/CallofDutyModernWarfare%282019%29.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/43/Call_of_Duty_Warzone_2.0_cover_art.jpg",
    "https://upload.wikimedia.org/wikipedia/en/5/51/Call_of_Duty_Modern_Warfare_3_Campaign_Remastered.jpg"
]

import ssl

def fetch_feed(feed_config):
    print(f"Fetching {feed_config['url']}...")
    req = urllib.request.Request(
        feed_config['url'], 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MW4-Scraper-Bot/1.0'}
    )
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            xml_data = response.read()
            return ET.fromstring(xml_data)
    except Exception as e:
        print(f"Failed to fetch {feed_config['url']}: {e}")
        return None

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def process_feeds():
    new_articles = []
    
    for feed in FEEDS:
        root = fetch_feed(feed)
        if root is None: continue
        
        # Determine if RSS 2.0 or Atom
        items = root.findall('.//item') # RSS
        if not items:
            items = root.findall('.//{http://www.w3.org/2005/Atom}entry') # Atom
            
        for item in items:
            # RSS fields
            title_el = item.find('title')
            link_el = item.find('link')
            desc_el = item.find('description')
            pub_el = item.find('pubDate')
            
            # Atom fallbacks
            if title_el is None: title_el = item.find('{http://www.w3.org/2005/Atom}title')
            if link_el is None: link_el = item.find('{http://www.w3.org/2005/Atom}link')
            if desc_el is None: desc_el = item.find('{http://www.w3.org/2005/Atom}summary')
            if pub_el is None: pub_el = item.find('{http://www.w3.org/2005/Atom}published')
            
            title = title_el.text if title_el is not None else ""
            
            # Handle Atom links which are attributes
            if link_el is not None and link_el.text:
                link = link_el.text
            elif link_el is not None and link_el.get('href'):
                link = link_el.get('href')
            else:
                link = ""
                
            desc = clean_html(desc_el.text) if desc_el is not None else ""
            
            # Check for keywords
            content_to_check = (title + " " + desc).lower()
            
            # Matching logic to include both strict MW4 and speculative 2026 rumors
            has_mw4 = re.search(r'\b(modern warfare 4|modern warfare iv|mw4)\b', content_to_check)
            has_2026_speculation = re.search(r'\b(call of duty 2026|cod 2026)\b', content_to_check)
            has_cod = re.search(r'\b(call of duty|cod)\b', content_to_check)
            
            # Require either explicit MW4 + CoD, OR explicit CoD 2026 speculation
            matched = (has_mw4 and has_cod) or has_2026_speculation
                    
            if matched:
                print(f"Found MW4 match: {title}")
                
                # Format date
                published_at = datetime.utcnow().isoformat() + "Z" # Fallback
                
                new_articles.append({
                    "id": str(uuid.uuid4()),
                    "title": title,
                    "summary": desc[:250] + "..." if len(desc) > 250 else desc,
                    "imageUrl": random.choice(PLACEHOLDER_IMAGES),
                    "sourceUrl": link,
                    "source": {
                        "name": feed['name'],
                        "credibility": feed['credibility']
                    },
                    "publishedAt": published_at,
                    "classification": "news",
                    "confidence": "medium",
                    "pinned": False,
                    "featured": False,
                    "confirmed": False,
                    "debunked": False
                })
                
    return new_articles

def main():
    print("Starting MW4 Auto-Scraper...")
    
    # Load existing data
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    existing_urls = {article.get('sourceUrl') for article in data.get('articles', [])}
    
    new_articles = process_feeds()
    
    added_count = 0
    for article in new_articles:
        if article['sourceUrl'] not in existing_urls and article['sourceUrl'] != "":
            # Add to top
            data['articles'].insert(0, article)
            existing_urls.add(article['sourceUrl'])
            added_count += 1
            
    if added_count > 0:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully added {added_count} new articles to news.json.")
    else:
        print("No new articles found.")

if __name__ == "__main__":
    main()