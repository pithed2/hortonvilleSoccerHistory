export function StoriesSection() {
  const stories = [
    {
      title: "How It All Started: Patrick Koss and the Beginning of Hortonville Soccer",
      year: "1998-1999",
      excerpt:
        "From casual pickup games to a thriving school program - the founding story of Hortonville Soccer and the key people who made it happen.",
      author: "Patrick Koss",
    },
    {
      title: "The Unforgettable Championship",
      year: "2003",
      excerpt: "The story of how an underdog team defeated the regional favorites in a dramatic playoff run...",
      author: "John Smith",
    },
    {
      title: "From Player to Coach",
      year: "2015",
      excerpt: "How one former player returned to give back to the program that shaped his life...",
      author: "Mike Johnson",
    },
    {
      title: "Building the Dream Field",
      year: "2012",
      excerpt: "A community effort to raise funds and construct the state-of-the-art facilities we use today...",
      author: "Sarah Williams",
    },
  ]

  return (
    <section id="stories" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Stories & Memories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Read the stories that define our program</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div
              key={story.title}
              className="bg-card rounded-lg p-8 border border-border hover:border-primary transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors">{story.title}</h3>
                  <p className="text-sm font-semibold text-primary">{story.year}</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{story.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground">By {story.author}</p>
                <span className="text-primary font-semibold text-sm">Read More →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
