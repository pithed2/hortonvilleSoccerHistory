"use client"

import { useEffect } from "react"
import { Facebook, Instagram } from "lucide-react"

const FACEBOOK_PAGE_URL = "https://www.facebook.com/profile.php?id=61588501114059"
const INSTAGRAM_URL = "https://www.instagram.com/hortonvillesoccer/"

// Instagram doesn't allow free auto-fetching of "whatever is newest" — the
// official embed requires a specific post permalink. Set this to the post you
// want featured (e.g. "https://www.instagram.com/p/XXXXXXXXXXX/") to show it;
// update it whenever you want to feature a different post.
const INSTAGRAM_FEATURED_POST_URL = "https://www.instagram.com/p/Dc2RTgHDQ5c/"

declare global {
  interface Window {
    FB?: { XFBML: { parse: () => void } }
    instgrm?: { Embeds: { process: () => void } }
  }
}

function loadEmbedScript(src: string, id: string) {
  if (document.getElementById(id)) return
  const script = document.createElement("script")
  script.id = id
  script.src = src
  script.async = true
  script.crossOrigin = "anonymous"
  document.body.appendChild(script)
}

export function SocialFeedSection() {
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse()
    else loadEmbedScript("https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0", "facebook-jssdk")

    if (window.instgrm) window.instgrm.Embeds.process()
    else loadEmbedScript("https://www.instagram.com/embed.js", "instagram-embed-js")
  }, [])

  return (
    <section className="border-t bg-muted/20 py-14 sm:py-16" aria-labelledby="social-feed-title">
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Stay connected</p>
            <h2 id="social-feed-title" className="section-title">Latest from social</h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="surface-card p-5 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Facebook className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Facebook</p>
                <h3 className="text-xl font-black">Hortonville Boys Soccer</h3>
              </div>
            </div>
            <div id="fb-root" />
            <div className="overflow-hidden rounded-xl">
              <div
                className="fb-page"
                data-href={FACEBOOK_PAGE_URL}
                data-tabs="timeline"
                data-height="300"
                data-small-header="true"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="false"
              >
                <blockquote cite={FACEBOOK_PAGE_URL} className="fb-xfbml-parse-ignore">
                  <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noreferrer">Hortonville Boys Soccer</a>
                </blockquote>
              </div>
            </div>
          </article>

          <article className="surface-card p-5 sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Instagram className="size-5" aria-hidden="true" /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Instagram</p>
                <h3 className="text-xl font-black">@hortonvillesoccer</h3>
              </div>
            </div>
            {INSTAGRAM_FEATURED_POST_URL ? (
              <div className="mx-auto max-h-[340px] w-full max-w-[340px] overflow-y-auto rounded-xl">
                <blockquote className="instagram-media" data-instgrm-permalink={INSTAGRAM_FEATURED_POST_URL} data-instgrm-version="14" style={{ margin: 0, minWidth: 0, width: "100%" }} />
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Instagram className="size-6" aria-hidden="true" /></div>
                <p className="font-bold">No featured post set yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Send over the Instagram post URL you want featured here and it'll show up in this spot.</p>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-link mt-4 text-sm">Visit @hortonvillesoccer</a>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
