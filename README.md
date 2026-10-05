# MB Lounge preview

Static site preview for The MB Lounge, deployed from the `main` branch to GitHub Pages. Site copy, layout settings, homepage sections, events, and brand assets are managed in Sveltia CMS and stored in this repository.

## Open the site and CMS

- Preview: <https://commerce-dash.github.io/MBLounge/>
- Content editor: <https://commerce-dash.github.io/MBLounge/admin/>
- CMS configuration: [`admin/config.yml`](admin/config.yml)
- Homepage content: [`content/site.json`](content/site.json)

Sign in to the CMS with a GitHub personal access token for an account that has write access to `commerce-dash/MBLounge`. Sveltia offers a token-generation link in its sign-in dialog. Grant only the repository Contents read/write access needed to edit site content and upload media. The token is entered into Sveltia’s sign-in prompt and is not added to this repository. After a CMS save commits to `main`, the GitHub Pages workflow publishes the update.

For a shared, one-click GitHub OAuth login, Sveltia needs an OAuth application and a small OAuth client service, such as its Cloudflare Worker authenticator. The site does not contain OAuth client secrets.

## Edit the logo ticker

In **Site & Homepage → Site content → Homepage → Page sections**, edit the **Scrolling logo ticker** section. Add each organization’s name, upload its logo, set its link destination, and choose whether the link opens a new tab. Set the scroll direction, loop speed, space between logos, gentle float effect, animation, and pause-on-hover behavior. The section appears on the public homepage after at least one logo has been added. The animation pauses for keyboard focus and hover and respects visitors’ reduced-motion settings.

Uploaded files are stored in `assets/uploads/`. The four supplied venue photos are in `assets/lounge/` and are already used in the homepage slideshow and story/private-event sections.

## Content model

- Site identity, logo, brand colors, font choices and optional font files.
- Navigation, marketing announcement, and search/social metadata.
- Upcoming event cards (date, time, description, link, highlight, visibility).
- Reorderable homepage modules: hero slideshow, events, live video, story, private events, community, promotional banner, rich text, photo gallery, static logo grid, and scrolling logo ticker.
- Layout width, section spacing, and corner style.

The live-feed module accepts the existing RTSP.me embed or supported YouTube/Vimeo embed URLs. The front end only embeds approved HTTPS player URLs.

## Hosting

`.github/workflows/pages.yml` deploys the repository root to GitHub Pages on every push to `main`. No custom domain is configured; the preview remains on `commerce-dash.github.io` until the domain is intentionally changed.
