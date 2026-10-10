import type { Metadata } from "next"
import { PolicyPage } from "@/components/policy-page"
export const metadata: Metadata = { title: "Accessibility" }
export default function Page() { return <PolicyPage title="Accessibility"><section><h2>Access to the site</h2><p>We aim to make team information usable with keyboards, screen readers, zoom, and reduced-motion preferences. WCAG 2.2 Level AA guides improvements. This is an ongoing effort, not a claim of certified or complete conformance.</p></section>
<section><h2>Report a barrier</h2><p>Email <a href="mailto:andrewmmontalbano@gmail.com">andrewmmontalbano@gmail.com</a> with the page address, what you were trying to do, and the problem. Include your browser or assistive technology if helpful. You can request the information in another format.</p></section>
<section><h2>External resources</h2><p>Linked documents and third-party websites may have different accessibility limitations. Contact us if a resource prevents access to needed team information.</p></section></PolicyPage> }
