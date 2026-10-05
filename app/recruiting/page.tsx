import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Download, GraduationCap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import progress from "@/public/recruiting/downloads/status.json"

export const metadata: Metadata = {
  title: "College Recruiting",
  description: "A men's college soccer recruiting guide for HHS players and parents, with a college fit worksheet and program contact directory.",
}

const fileRoot = "/recruiting/downloads/"
const guideSections = [
  { number: 1, title: "Choose a school you want to attend", description: "Work out what matters to you in school, cost and soccer.", anchor: "section-1-choose-a-school-you-want-to-attend" },
  { number: 2, title: "Select schools worth a closer look", description: "Build your school list and evaluate recruiting messages.", anchor: "section-2-how-to-select-schools-worth-a-closer-look" },
  { number: 3, title: "Understand the college soccer pathways", description: "Explore NCAA, NAIA, junior college, reserve and club options.", anchor: "section-3-understand-the-college-soccer-pathways" },
  { number: 4, title: "Research schools and programs", description: "Look into playing style, rosters and the player experience.", anchor: "section-4-research-schools-and-programs" },
  { number: 5, title: "Academics, admission and eligibility", description: "Understand the school requirements and eligibility questions.", anchor: "section-5-academics-admission-and-eligibility" },
  { number: 6, title: "Know when coaches can recruit", description: "Check the recruiting rules and timing for your pathway.", anchor: "section-6-know-when-coaches-can-recruit" },
  { number: 7, title: "Build your player evidence", description: "Prepare your profile, film and coach references.", anchor: "section-7-build-your-player-evidence" },
  { number: 8, title: "Contact coaches authentically", description: "Verify your recipient, write your introduction and follow up.", anchor: "section-8-contact-coaches-authentically" },
  { number: 9, title: "Evaluate interest, camps and visits", description: "Assess opportunities and prepare useful questions.", anchor: "section-9-evaluate-interest-camps-and-visits" },
  { number: 10, title: "Understand offers and real costs", description: "Compare the offer, financial aid and what your family would pay.", anchor: "section-10-understand-offers-and-real-costs" },
  { number: 11, title: "Make the decision and prepare", description: "Choose your next step and get ready for the transition.", anchor: "section-11-make-the-decision-and-prepare" },
] as const

export default function RecruitingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">HHS players and families</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">College soccer. Start with the school.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">You don&apos;t have to figure out recruiting on your own. This guide is for boys and their parents who want to explore playing college soccer. Use it to find a school you&apos;d want to attend, understand the soccer options and work through the recruiting process.</p>

        <section aria-labelledby="fit-title" className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <GraduationCap className="size-8 text-primary" aria-hidden="true" />
          <h2 id="fit-title" className="mt-4 text-2xl font-bold">What&apos;s your best fit?</h2>
          <p className="mt-3 max-w-3xl leading-relaxed">Start with school, cost and the soccer experience you want. If you&apos;re exploring varsity, add your competition level, match role, film and coach feedback. You&apos;ll get levels to start researching, stretch questions and next steps, with an explanation of what supports each suggestion. Your answers can&apos;t replace a coach watching you or predict an offer.</p>
          <a href="/recruiting/best-fit.html" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Start the fit guide <ArrowRight className="size-4" aria-hidden="true" /></a>
          <p className="mt-3 text-sm text-muted-foreground">Your answers stay on the page while it&apos;s open. You can download or print your notes before leaving.</p>
        </section>

        <section aria-labelledby="guide-sections-title" className="mt-12">
          <h2 id="guide-sections-title" className="text-2xl font-bold">Explore the recruiting guide</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">Start at the beginning or jump to the part you need today. Each section opens directly in the online blueprint.</p>
          <a href="/recruiting/blueprint.html#introduction" className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-primary">Read the introduction <ArrowRight className="size-4" aria-hidden="true" /></a>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guideSections.map((section) => (
              <a key={section.number} href={`/recruiting/blueprint.html#${section.anchor}`} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Section {section.number}</p>
                <h3 className="mt-2 text-lg font-bold">{section.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Read section <ArrowRight className="size-4" aria-hidden="true" /></span>
              </a>
            ))}
          </div>
          <a href="/recruiting/blueprint.html#ai-prompt-appendix" className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary">Explore the AI research prompts <ArrowRight className="size-4" aria-hidden="true" /></a>
        </section>

        <section id="downloads" aria-labelledby="downloads-title" className="mt-12 scroll-mt-24">
          <h2 id="downloads-title" className="text-2xl font-bold">Take the guide with you</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">Start with the introduction and Sections 1-3. Already talking with coaches? Sections 8-9 cover communication, interest and visits. Comparing an offer? Read Section 10 with a parent.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border bg-card p-6">
              <h3 className="text-xl font-bold">Recruiting blueprint</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">The complete guide, Sections 1-11 and the AI prompt appendix. School fit, team research, eligibility, film, contacting coaches and the real cost of an offer.</p>
              <a href="/recruiting/blueprint.html" className="mt-5 flex min-h-11 items-center gap-2 font-bold text-primary">Read the blueprint online <ArrowRight className="size-4" aria-hidden="true" /></a>
              <a href={`${fileRoot}HHS_College_Soccer_Recruiting_Blueprint_2026.pdf`} download className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary"><Download className="size-4" aria-hidden="true" /> Download the blueprint (PDF)</a>
            </article>
            <article className="rounded-2xl border bg-card p-6">
              <h3 className="text-xl font-bold">Programs and coach contacts</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">One Excel workbook with D1, D2, D3, NAIA and junior-college tabs. Filter schools, check the sources and keep your own recruiting notes.</p>
              <a href={`${fileRoot}College_Soccer_Recruiting_Directory_2026.xlsx`} download className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary"><Download className="size-4" aria-hidden="true" /> Download the directory (Excel)</a>
            </article>
          </div>
          <aside className="mt-5 rounded-xl border bg-muted/50 p-5 text-sm leading-relaxed">
            <h3 className="font-bold">The contact directory is a work in progress</h3>
            <p className="mt-2"><strong>Verify the recipient before every email.</strong> Even when a contact appears in our spreadsheet, confirm the coach&apos;s name, current role and email on the school&apos;s official men&apos;s soccer staff page or athletics directory. Coaches change jobs. Sending to a former coach or using the wrong name can make you look unprepared and keep your message from reaching the current staff. If no address is published, use the recruiting questionnaire or ask the athletics office for the right contact.</p>
            <p className="mt-2">The download is a reader snapshot from {progress.checkedLabel}. D1 and D3 contacts form our completed baseline; D2, NAIA and junior-college contact coverage is still being expanded. We maintain a separate working directory, so background research doesn&apos;t change this snapshot. Blank emails mean an address isn&apos;t available in this copy. Check the school&apos;s current official staff page before sending.</p>
            <p className="mt-2">The blueprint is the current reading copy, and we&apos;ll keep improving it. Rules can change. Confirm the requirements that apply to you with the school.</p>
          </aside>
          <a href={`${fileRoot}HHS_Recruiting_Package_2026.zip`} download className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary"><Download className="size-4" aria-hidden="true" /> Download everything (ZIP)</a>
          <p className="mt-1 text-sm text-muted-foreground">Includes the PDF, editable text guide, directory appendix and Excel workbook.</p>
        </section>
        <p className="mt-10 border-t pt-6 leading-relaxed text-muted-foreground">Bring your notes to us. We can help assess your game and talk through programs to research. <Link href="/coaches" className="font-semibold text-primary underline">Meet the HHS coaches</Link>.</p>
      </main>
      <Footer />
    </div>
  )
}
