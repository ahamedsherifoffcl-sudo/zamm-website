(function () {
  'use strict';

  const d = document;
  const script = d.currentScript;
  const pageType = (script && script.dataset.pageType) || d.body?.dataset.pageType || 'page';
  const pageSlug = (script && script.dataset.pageSlug) || d.body?.dataset.pageSlug || '';
  const isWeb = location.protocol === 'http:' || location.protocol === 'https:';
  const SITE_ORIGIN = 'https://zammdevolopers.in';
  const activeRoot = d.querySelector(window.matchMedia('(max-width: 1050px)').matches ? '.mobile-site-shell' : '.desktop-site-shell') || d;
  if (!isWeb) return;

  const cleanPath = location.pathname.replace(/\/index\.html$/i, '/');
  const canonicalUrl = new URL(cleanPath || '/', SITE_ORIGIN).href;
  const homeUrl = new URL('/', SITE_ORIGIN).href;
  const logoUrl = new URL('/assets/images/zamm-search-logo-512.png', SITE_ORIGIN).href;
  const socialImageUrl = new URL('/assets/images/zamm-social-preview.webp', SITE_ORIGIN).href;

  function setLink(rel, href) {
    let el = d.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = d.createElement('link');
      el.rel = rel;
      d.head.appendChild(el);
    }
    el.href = href;
    return el;
  }

  function setMeta(selector, attr, value) {
    let el = d.head.querySelector(selector);
    if (!el) {
      el = d.createElement('meta');
      if (selector.includes('property=')) el.setAttribute('property', attr);
      else el.setAttribute('name', attr);
      d.head.appendChild(el);
    }
    el.content = value;
    return el;
  }

  setLink('canonical', canonicalUrl);
  setMeta('meta[property="og:url"]', 'og:url', canonicalUrl);
  setMeta('meta[property="og:image"]', 'og:image', socialImageUrl);
  setMeta('meta[name="twitter:image"]', 'twitter:image', socialImageUrl);

  // Single-language site: one self-referencing language alternate plus x-default.
  let altEn = d.head.querySelector('link[rel="alternate"][hreflang="en-IN"]');
  if (!altEn) {
    altEn = d.createElement('link');
    altEn.rel = 'alternate';
    altEn.hreflang = 'en-IN';
    d.head.appendChild(altEn);
  }
  altEn.href = canonicalUrl;
  let altDefault = d.head.querySelector('link[rel="alternate"][hreflang="x-default"]');
  if (!altDefault) {
    altDefault = d.createElement('link');
    altDefault.rel = 'alternate';
    altDefault.hreflang = 'x-default';
    d.head.appendChild(altDefault);
  }
  altDefault.href = canonicalUrl;

  // Static JSON-LD is embedded in every indexable page for reliable crawling.
  if (d.head.querySelector('script[data-static-seo-jsonld]')) return;

  const title = d.title.trim();
  const description = d.head.querySelector('meta[name="description"]')?.content || '';
  const h1 = activeRoot.querySelector('main h1')?.textContent.trim() || title;
  const orgId = `${homeUrl}#organization`;
  const websiteId = `${homeUrl}#website`;
  const webpageId = `${canonicalUrl}#webpage`;

  const organization = {
    '@type': 'LocalBusiness',
    '@id': orgId,
    name: 'Zamm Devolopers',
    alternateName: ['Zamm Developers'],
    legalName: 'Zamm Devolopers',
    url: homeUrl,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      contentUrl: logoUrl,
      width: 512,
      height: 512
    },
    image: socialImageUrl,
    description: 'Chennai website development company creating customized, responsive and SEO-friendly websites, landing pages, e-commerce stores and local business websites.',
    slogan: 'Websites that help businesses get found and grow.',
    priceRange: '₹₹',
    telephone: '+91 86680 16504',
    email: 'zammdevolopers@gmail.com',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91 86680 16504',
      contactType: 'sales',
      areaServed: 'IN'
    },
    founder: {
      '@type': 'Person',
      name: 'Ahamed Sherif',
      jobTitle: 'Web Developer, SEO Developer and Data Analyst'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Andavar Nagar, Ramapuram',
      addressLocality: 'Chennai',
      addressRegion: 'Tamil Nadu',
      postalCode: '600089',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.0306949,
      longitude: 80.1815755
    },
    areaServed: [
      {'@type': 'City', name: 'Chennai'},
      {'@type': 'AdministrativeArea', name: 'Tamil Nadu'},
      {'@type': 'Country', name: 'India'}
    ],
    knowsAbout: [
      'Website Development',
      'Search Engine Optimization',
      'Landing Page Development',
      'Google Business Profile Websites',
      'E-Commerce Website Development',
      'Responsive Web Design'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Website Development and SEO Services',
      itemListElement: [
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'Custom Website Development','url':new URL('/website-development.html', SITE_ORIGIN).href}},
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'SEO Optimization Services','url':new URL('/seo-optimization.html', SITE_ORIGIN).href}},
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'Landing Page Development','url':new URL('/landing-page-development.html', SITE_ORIGIN).href}},
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'Google Business Website Development','url':new URL('/google-business-service-website.html', SITE_ORIGIN).href}},
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'E-Commerce Website Development','url':new URL('/ecommerce-website-development.html', SITE_ORIGIN).href}},
        {'@type':'Offer','itemOffered':{'@type':'Service','name':'Website Redesign and Maintenance','url':new URL('/website-redesign-maintenance.html', SITE_ORIGIN).href}}
      ]
    },
    hasMap: 'https://maps.app.goo.gl/UwPs9bBRGPAQYCLh7'
  };

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: homeUrl,
    name: 'Zamm Devolopers',
    alternateName: ['Zamm Developers'],
    description,
    publisher: {'@id': orgId},
    inLanguage: 'en-IN'
  };

  const webpage = {
    '@type': pageType === 'about' ? 'AboutPage' : pageType === 'contact' ? 'ContactPage' : pageType === 'services' ? 'CollectionPage' : pageType === 'blog-index' ? 'Blog' : 'WebPage',
    '@id': webpageId,
    url: canonicalUrl,
    name: title,
    headline: h1,
    description,
    isPartOf: {'@id': websiteId},
    about: {'@id': orgId},
    primaryImageOfPage: {'@type': 'ImageObject', url: socialImageUrl},
    inLanguage: 'en-IN',
    dateModified: '2026-07-26'
  };

  const graph = [organization, website, webpage];

  const breadcrumb = activeRoot.querySelector('.breadcrumb');
  const items = [];
  if (breadcrumb) {
    let pos = 1;
    breadcrumb.querySelectorAll('a, span').forEach((node) => {
      const name = node.textContent.trim();
      if (!name || name === '›' || name === '/') return;
      const item = {'@type': 'ListItem', position: pos++, name};
      if (node.tagName === 'A' && node.getAttribute('href')) {
        item.item = new URL(node.getAttribute('href'), canonicalUrl).href.replace(/\/index\.html$/i, '/');
      } else {
        item.item = canonicalUrl;
      }
      items.push(item);
    });
  } else if (cleanPath !== '/') {
    items.push({'@type':'ListItem', position:1, name:'Home', item:homeUrl});
    if (pageType === 'article') {
      items.push({'@type':'ListItem', position:2, name:'Blog', item:new URL('/blog.html', SITE_ORIGIN).href});
    } else if (pageType === 'service') {
      items.push({'@type':'ListItem', position:2, name:'Services', item:new URL('/services.html', SITE_ORIGIN).href});
    }
    items.push({'@type':'ListItem', position:items.length + 1, name:h1, item:canonicalUrl});
  }
  if (items.length) {
    graph.push({'@type': 'BreadcrumbList', '@id': `${canonicalUrl}#breadcrumb`, itemListElement: items});
    webpage.breadcrumb = {'@id': `${canonicalUrl}#breadcrumb`};
  }

  if (pageType === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${canonicalUrl}#service`,
      name: h1,
      description,
      url: canonicalUrl,
      provider: {'@id': orgId},
      areaServed: ['Chennai', 'Tamil Nadu', 'India'],
      serviceType: h1,
      audience: {'@type': 'BusinessAudience', audienceType: 'Businesses seeking website and SEO services'}
    });
    webpage.mainEntity = {'@id': `${canonicalUrl}#service`};
  }

  if (pageType === 'article' || pageType === 'case-study') {
    const articleId = `${canonicalUrl}#article`;
    graph.push({
      '@type': pageType === 'case-study' ? 'Article' : 'BlogPosting',
      '@id': articleId,
      mainEntityOfPage: {'@id': webpageId},
      headline: h1,
      description,
      image: [socialImageUrl],
      datePublished: '2026-07-25',
      dateModified: '2026-07-26',
      author: {'@id': orgId},
      publisher: {'@id': orgId},
      inLanguage: 'en-IN'
    });
    webpage.mainEntity = {'@id': articleId};
  }

  {
    const faqItems = Array.from(activeRoot.querySelectorAll('details[data-seo-faq="true"]')).map((item) => {
      const question = item.querySelector('summary')?.textContent.trim();
      const answer = item.querySelector('p')?.textContent.trim();
      if (!question || !answer) return null;
      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {'@type': 'Answer', text: answer}
      };
    }).filter(Boolean);
    if (faqItems.length) {
      const faqId = `${canonicalUrl}#faq`;
      graph.push({'@type': 'FAQPage', '@id': faqId, mainEntity: faqItems});
      webpage.hasPart = {'@id': faqId};
    }
  }


  if (pageType === 'services') {
    const serviceItems = Array.from(activeRoot.querySelectorAll('.service-card a[href]')).map((link, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: link.closest('.service-card')?.querySelector('h3')?.textContent.trim() || link.textContent.trim(),
      url: new URL(link.getAttribute('href'), canonicalUrl).href
    }));
    if (serviceItems.length) {
      graph.push({'@type':'ItemList','@id':`${canonicalUrl}#services-list`,name:'Zamm Devolopers website services',itemListElement:serviceItems});
    }
  }

  let jsonLd = d.head.querySelector('script[data-seo-jsonld]');
  if (!jsonLd) {
    jsonLd = d.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.dataset.seoJsonld = 'true';
    d.head.appendChild(jsonLd);
  }
  jsonLd.textContent = JSON.stringify({'@context': 'https://schema.org', '@graph': graph});
})();
