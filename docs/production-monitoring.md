# Production monitoring

Optional checks live in `.github/workflows/site-health.yml`. When run manually, they
rebuild the site, validate catalog relationships and generated pages, and check every
unique external listening URL. Failures appear in the repository's Actions tab.

The catalog workflow can be run manually to compare the public Suno profile with
the checked-in metadata and attempt a pull request when something changes.
Neither workflow runs on a schedule.

## Search consoles

The domain owner should verify `alexmercedmusic.com` in Google Search Console and
submit `https://alexmercedmusic.com/sitemap-index.xml`. Review Page indexing,
Core Web Vitals, rich-result issues, and the Generative AI performance report after
major catalog releases. Use URL Inspection on representative acoustic, electronic,
reimagined, generated-song, and album pages.

Search Console credentials are intentionally not stored in this repository.
