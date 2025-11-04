"use client"

import { useState } from "react"
import Image from "next/image"

export function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "teams", label: "Team Photos" },
    { id: "fields", label: "Field Locations" },
    { id: "events", label: "Events & Celebrations" },
    { id: "moments", label: "Key Moments" },
  ]

  // Placeholder photos - replace with actual Google Drive integration
  const photos = [
    { id: 1, category: "teams", src: "/youth-soccer-team-photo.jpg", alt: "Team photo" },
    { id: 2, category: "fields", src: "/soccer-field.png", alt: "Soccer field" },
    { id: 3, category: "events", src: "/soccer-celebration.png", alt: "Celebration" },
    { id: 4, category: "moments", src: "/soccer-match-moment.jpg", alt: "Match moment" },
    { id: 5, category: "teams", src: "/soccer-team-lineup.jpg", alt: "Team lineup" },
    { id: 6, category: "fields", src: "/outdoor-soccer-field.jpg", alt: "Soccer field" },
    { id: 7, category: "events", src: "/soccer-awards-ceremony.jpg", alt: "Awards" },
    { id: 8, category: "moments", src: "/soccer-goal-celebration.png", alt: "Goal celebration" },
  ]

  const filtered = selectedCategory === "all" ? photos : photos.filter((p) => p.category === selectedCategory)

  return (
    <section id="gallery" className="py-20 md:py-32 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-balance">Photo Archive</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse through decades of memories and moments
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-primary-foreground font-semibold text-sm">{photo.alt}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Want to see more? Connect with our Google Photos album to browse thousands of images
          </p>
          <a
            href="#contribute"
            className="inline-block bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Browse Full Album
          </a>
        </div>
      </div>
    </section>
  )
}
