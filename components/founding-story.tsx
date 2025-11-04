export function FoundingStory() {
  return (
    <section id="founding-story" className="py-20 md:py-32 bg-card border-t border-b border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">How It All Started</h2>
          <p className="text-lg text-muted-foreground">The founding story of Hortonville Soccer</p>
        </div>

        {/* Founding Story Card */}
        <div className="bg-background rounded-lg p-8 md:p-12 border border-primary/20 mb-8">
          <div className="mb-6">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider">Patrick Koss - Founder</p>
            <p className="text-muted-foreground text-sm">1998-1999 School Year</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
            <p>
              "I started working here I think the 98/99 school year. I was kicking the soccer ball around outside one
              night and the next thing you know a couple of students started kicking it around with me. That led to
              pickup soccer games. These were students that had been playing club for FC Magic and a couple of other
              clubs."
            </p>

            <p>
              "The next year it got more serious. Students wanted to play pick up games. Mike Sommers (the head football
              coach at the time) dropped off a sack of brine soccer balls and some pennies. He was great. He said that
              he thought it was great that students could find a way to get involved with school. Mary Lynn Hermus,
              counseling, was also helpful."
            </p>

            <p>
              "I was playing around on several leagues - Neenah, Milwaukee, New London, Oshkosh and indoor at Soccer
              Heaven. I started talking to some of the coaches I would play with and setup some pickup JV games. We were
              able to get school transportation (Mrs. Sharon Becker the principal supported with transportation) and
              started playing just a couple of games with local high schools. New London was great. Early players were
              Keaton Craddock (a goalie) and Ben Yankee."
            </p>

            <p>
              "This led to Mrs. Craddock trying to get the school to have a team. She was the fire that got the team
              going. I was still in the military, so I couldn't commit to coaching the team. I was happy to hear that
              she was able to secure a club coach, Gary Ruhle. Then Dena Craddock and Mandy Price were some of the first
              girls to play for the coed team."
            </p>

            <p>
              "When Jason Hurley became AD - that led to the team having more support. Getting them to play on campus.
              Moving forward. This guy Andy Montalbano showed up. Did a great job! A lot of people touched this program.
              I'm happy to see it grow."
            </p>
          </div>
        </div>

        {/* Key Founders Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background rounded-lg p-6 border border-border">
            <h3 className="font-black mb-3 text-primary">Early Supporters</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • <span className="font-semibold">Patrick Koss</span> - Founder, initiated pickup games
              </li>
              <li>
                • <span className="font-semibold">Mike Sommers</span> - Football Coach, provided equipment
              </li>
              <li>
                • <span className="font-semibold">Sharon Becker</span> - Principal, supported transportation
              </li>
              <li>
                • <span className="font-semibold">Mary Lynn Hermus</span> - Counselor, provided support
              </li>
            </ul>
          </div>

          <div className="bg-background rounded-lg p-6 border border-border">
            <h3 className="font-black mb-3 text-primary">Program Builders</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • <span className="font-semibold">Mrs. Craddock</span> - Established school team
              </li>
              <li>
                • <span className="font-semibold">Gary Ruhle</span> - First club coach
              </li>
              <li>
                • <span className="font-semibold">Dena Craddock & Mandy Price</span> - First female players
              </li>
              <li>
                • <span className="font-semibold">Jason Hurley</span> - Athletic Director, expanded support
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground italic">
            "A lot of people touched this program. I'm happy to see it grow." - Patrick Koss
          </p>
        </div>
      </div>
    </section>
  )
}
