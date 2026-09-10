# Production monitoring

Automated checks live in `.github/workflows/site-health.yml`. They rebuild the site,
validate catalog relationships and generated pages, and check every unique external
listening URL each Monday. Failures appear in the repository's Actions tab.

The daily catalog workflow compares the public Suno profile with the checked-in
metadata and opens a reviewed pull request when a song or its metadata changes.

## Search consoles

The domain owner should verify `alexmercedmusic.com` in Google Search Console and
submit `https://alexmercedmusic.com/sitemap-index.xml`. Review Page indexing,
Core Web Vitals, rich-result issues, and the Generative AI performance report after
major catalog releases. Use URL Inspection on representative acoustic, electronic,
reimagined, generated-song, and album pages.

Search Console credentials are intentionally not stored in this repository.
