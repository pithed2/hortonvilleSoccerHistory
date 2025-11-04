"use client"

import Image from "next/image"

export function FieldLocations() {
  return (
    <section id="fields" className="py-20 md:py-32 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Our Fields Through the Years</h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            The physical homes where Hortonville Soccer has grown, played, and built memories
          </p>
        </div>

        {/* Original Campus Fields */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-3">Original Campus Fields (1998-2000s)</h3>
              <p className="text-foreground mb-4">
                The Hortonville Soccer Program began with Varsity and Junior Varsity fields located on the high school
                campus. The JV field featured a distinctive large cottonwood tree just feet off the sideline—a landmark
                that many early players remember fondly.
              </p>
              <p className="text-muted-foreground text-sm italic">
                These original fields now have a parking lot and driveway running through them, a reminder of how the
                campus has evolved alongside the program.
              </p>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Field Evolution</h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Field 1 & 2:</strong> Original practice and game venues on campus
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>The Cottonwood Tree:</strong> Iconic landmark on JV field sideline
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Campus Transition:</strong> Fields relocated as school expanded
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg">
            <Image
              src="/images/field-locations-aerial.png"
              alt="Aerial view of Hortonville High School campus showing original soccer field locations"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Commercial Club Field */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg order-2 lg:order-1">
            <Image
              src="/images/commercial-club-field-annotated.jpg"
              alt="Aerial view of Commercial Club field showing soccer field location, active electric fence protecting adjacent cow pasture, and proximity to Highway 15 bypass"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-3">Commercial Club Field (2000s-Present)</h3>
              <p className="text-foreground mb-4">
                Through a partnership with the Hortonville Commercial Club, the program secured a varsity game field
                located behind the baseball diamonds. The field offered new opportunities, but came with unique
                challenges.
              </p>
              <p className="text-foreground mb-4">
                Just beyond the sideline sat an active cow pasture, protected by an electric fence that kept the cattle
                in—but made retrieving stray balls a memorable adventure. Players and coaches have stories about the
                risks taken to recover balls from the pasture.
              </p>
              <p className="text-muted-foreground text-sm italic">
                This property is now close to where the Highway 15 bypass runs, marking another chapter in how
                development has shaped the program's home venues.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                The Electric Fence Stories
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Retrieving soccer balls from the adjacent cow pasture became part of the program's lore. The active
                electric fence added an element of caution and courage to the game—a quirky but memorable part of
                Hortonville Soccer history that players still talk about today.
              </p>
            </div>
          </div>
        </div>

        {/* Middle School Field Development */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-3">Middle School Field Development (2008-Present)</h3>
              <p className="text-foreground mb-4">
                Through strong community partnerships and dedicated leadership, the program was able to rebuild an
                overgrown field behind Hortonville Middle School into a top-notch, full-size pitch and practice area.
                This represented a major transformation and a return to campus facilities.
              </p>
              <p className="text-foreground mb-4">The facility's success came through collaboration:</p>
              <ul className="space-y-2 text-sm text-foreground mb-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Jeff Kellner & McMahon Associates:</strong> Led the field reconstruction and development
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Drs. Claybaugh & Dunathan:</strong> Provided the scoreboard to complete the first phase
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Paul Everett:</strong> Secured the full-sized equipment supply shed and weather shelter
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>Hortonville Area School District:</strong> Provided bleacher seating
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground text-sm italic">
                What was once overgrown has become a premier home venue, complete with all the infrastructure needed for
                a competitive program.
              </p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-j5qhOacSCpLRgdwKfq62ntdCgeUqBV.png"
              alt="Aerial view of Hortonville Middle School showing rebuilt soccer field with scoreboard, supply shed, bleachers, and the Polar Bears stadium complex"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Akin Field Stadium - 2009 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RLxyHuiryIRBHCcYAvEuRUtw3oJHrd.png"
              alt="Aerial view of Akin Field stadium showing Hortonville Polar Bears football field lined for soccer, with visible JV field and lights"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-3">Akin Field Stadium (2009-2017)</h3>
              <p className="text-foreground mb-4">
                After years of discussion with school leadership and fighting for the program's legitimacy as a varsity
                sport, Hortonville Soccer played their first game under the lights on the Akin Field stadium in August
                2009. This represented a major milestone and validation for the program.
              </p>
              <p className="text-foreground mb-4">
                The stadium field was a grass football field that required soccer-specific lining for each match. While
                regularly beaten up from football season and narrower than ideal for soccer, playing under the lights
                with an announcer provided the prestige and visibility the program had fought for.
              </p>
              <p className="text-foreground mb-4">
                The adjacent JV field offered better field conditions but lacked the same prestige. Many varsity games
                were strategically scheduled under the lights, making Hortonville Soccer a visible part of the fall
                athletic calendar.
              </p>
              <p className="text-muted-foreground text-sm italic">
                This shift symbolized the program's arrival as a legitimate varsity sport within the Hortonville school
                community.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">A Major Achievement</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Playing under the lights at a stadium field cemented Hortonville Soccer's place as a valued varsity
                sport. The years of advocacy and community support finally paid off, and the program gained visibility
                and legitimacy that elevated its status within the school.
              </p>
            </div>
          </div>
        </div>

        {/* Akin Field Stadium - 2018 Upgrade */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-primary mb-3">Akin Field Stadium Modernization (2018-Present)</h3>
              <p className="text-foreground mb-4">
                In 2018, the soccer program joined forces with football, track and field, and the school district to
                completely upgrade and modernize Akin Field. This collaborative effort transformed the stadium into a
                state-of-the-art facility that met the needs of all three sports while prioritizing soccer.
              </p>
              <p className="text-foreground mb-4">
                The field was completely resurfaced with professional-grade artificial turf, widened to proper soccer
                dimensions, and permanently lined for both soccer and football. The design allows football uprights to
                rotate away when not in use, ensuring they never interfere with the soccer pitch.
              </p>
              <p className="text-foreground mb-4">
                Additional infrastructure added to the facility includes a large coaching and team building structure
                for pre-game and halftime strategy sessions away from the field, a massive modern scoreboard, and
                improved spectator amenities. The facility now serves as a source of pride for the entire athletic
                program.
              </p>
              <p className="text-muted-foreground text-sm italic">
                From grass that required manual lining to professional turf with permanent soccer and football lines,
                Hortonville Soccer finally has a home that matches its level of competition and community support.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">A Shared Vision</h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                The 2018 upgrade represented unprecedented collaboration between multiple athletic programs and the
                school district. Each sport benefited from the modernization, but the facility was designed with soccer
                in mind—a testament to how far the program had come in gaining respect and resources.
              </p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border-2 border-primary/30 shadow-lg">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-msNw7tNysun7szyrnKHP8JZOEvd8Pj.png"
              alt="Aerial view of modernized Akin Field showing professional turf, permanent soccer and football lines, rotating uprights, coaching facility building, and large scoreboard"
              width={600}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">A Living Legacy</h3>
          <p className="text-foreground mb-4">
            From the cottonwood tree on campus to the electric fence adventure at the Commercial Club, to the rebuilt
            middle school facility, each location has shaped the character of the Hortonville Soccer Program. Today, the
            program plays on modern facilities built through community support and shared vision.
          </p>
          <p className="text-muted-foreground">
            If you have photos or memories from these field locations, we'd love to hear your stories and see your
            images.
          </p>
        </div>
      </div>
    </section>
  )
}
