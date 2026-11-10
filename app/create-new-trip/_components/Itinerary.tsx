import React from 'react'
import { Timeline } from "@/components/ui/timeline";

const TRIP_DATA = {

    "destination": "Goa",
    "duration": "3 days",
    "origin": "Bangladesh",
    "budget": "Moderate",
    "group_size": "1",
    "hotels": [
        {
            "hotel_name": "Calangute Beach Guesthouse",
            "hotel_address": "Calangute, Goa",
            "price_per_night": "₹1500",
            "hotel_image_url": "https://images.unsplash.com/photos/calangute-beach-1",
            "geo_coordinates": {
                "latitude": -13.8267,
                "longitude": 73.7675
            },
            "rating": 4.2,
            "description": "A cozy boutique guesthouse near Calangute Beach, offering clean rooms, free Wi‑Fi, and homemade Goan breakfast."
        }
    ],
    "itinerary": [
        {
            "day": 1,
            "day_plan": "Arrive in Goa, check‑in, relax at Calangute Beach, take a surf lesson, and watch the sunset at Candolim Beach.",
            "best_time_to_visit_day": "Morning (arrival) and Evening (sunset)",
            "activities": [
                {
                    "place_name": "Calangute Beach",
                    "place_details": "Beach surfing spot with gentle waves, ideal for beginners.",
                    "place_image_url": "https://goa-tour.com/calangute.jpg",
                    "geo_coordinates": {
                        "latitude": -13.8267,
                        "longitude": 73.7675
                    },
                    "place_address": "Calangute Beach, Goa",
                    "ticket_pricing": "₹500 (surf lesson)",
                    "time_travel_each_location": "Taxi from airport to beach (~30 min)",
                    "best_time_to_visit": "08:00 AM"
                },
                {
                    "place_name": "Candolim Beach",
                    "place_details": "Scenic sunset views over the Arabian Sea, popular for evening walks.",
                    "place_image_url": "https://goa-tour.com/candolim.jpg",
                    "geo_coordinates": {
                        "latitude": -13.8278,
                        "longitude": 73.7719
                    },
                    "place_address": "Candolim Beach, Goa",
                    "ticket_pricing": "Free",
                    "time_travel_each_location": "Drive back to hotel (~20 min) and walk to beach",
                    "best_time_to_visit": "18:30 PM"
                }
            ]
        },
        {
            "day": 2,
            "day_plan": "Adventure day: guided jeep safari to Dudhsagar Waterfalls, return to Anjuna Beach for paddleboarding and relaxation.",
            "best_time_to_visit_day": "Morning (early start for trek)",
            "activities": [
                {
                    "place_name": "Dudhsagar Waterfall",
                    "place_details": "Guided jeep safari to the base of Dudhsagar Falls with a short forest trek.",
                    "place_image_url": "https://goa-tour.com/dudhsagar.jpg",
                    "geo_coordinates": {
                        "latitude": -19.0996,
                        "longitude": 74.0833
                    },
                    "place_address": "Dudhsagar, Goa",
                    "ticket_pricing": "₹1200 (jeep tour)",
                    "time_travel_each_location": "Drive from Calangute to Dudhsagar (~3 hrs)",
                    "best_time_to_visit": "06:30 AM"
                },
                {
                    "place_name": "Anjuna Beach Paddleboard",
                    "place_details": "Rent a paddleboard for fun on calm waters, great for relaxation.",
                    "place_image_url": "https://goa-tour.com/anjuna.jpg",
                    "geo_coordinates": {
                        "latitude": -13.8285,
                        "longitude": 73.869
                    },
                    "place_address": "Anjuna Beach, Goa",
                    "ticket_pricing": "₹600 (rental)",
                    "time_travel_each_location": "Return from Dudhsagar (~2 hrs drive) and head to Anjuna",
                    "best_time_to_visit": "15:00 PM"
                }
            ]
        },
        {
            "day": 3,
            "day_plan": "Explore historic Old Goa – Fort Aguada and colonial churches, enjoy local lunch at Vagator before departure.",
            "best_time_to_visit_day": "Morning (tourist hours 10 am–4 pm)",
            "activities": [
                {
                    "place_name": "Fort Aguada & Old Goa Churches",
                    "place_details": "Visit the historic fort and colonial churches such as Se Cathedral and Bom Jesus Basilica.",
                    "place_image_url": "https://goa-tour.com/fortaguada.jpg",
                    "geo_coordinates": {
                        "latitude": -13.9233,
                        "longitude": 73.8715
                    },
                    "place_address": "Fort Aguada, Goa",
                    "ticket_pricing": "Free (exterior)",
                    "time_travel_each_location": "Drive from Anjuna to Fort (~1 hr)",
                    "best_time_to_visit": "10:00 AM"
                },
                {
                    "place_name": "Vagator Lunch",
                    "place_details": "Enjoy a seafood thali at a local eatery, try Goan pork vindaloo.",
                    "place_image_url": "https://goa-tour.com/vagator.jpg",
                    "geo_coordinates": {
                        "latitude": -13.8235,
                        "longitude": 73.77
                    },
                    "place_address": "Vagator, Goa",
                    "ticket_pricing": "₹500 (lunch)",
                    "time_travel_each_location": "Return to hotel and go out for dinner",
                    "best_time_to_visit": "17:00 PM"
                }
            ]
        }
    ]

}

function Itinerary() {
    const data = [
    {
      title: "2024",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Built and launched Aceternity UI and Aceternity UI Pro from scratch
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/templates/startup-1.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-2.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-3.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-4.webp"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Early 2023",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            I usually run out of copy, but when I see content this big, I try to
            integrate lorem ipsum.
          </p>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Lorem ipsum is for people who are too lazy to write copy. But we are
            not. Here are some more example of beautiful designs I built.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="feature template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="bento template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="cards template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Changelog",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Deployed 5 new components on Aceternity today
          </p>
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
              ✅ Card grid component
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
              ✅ Startup template Aceternity
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
              ✅ Random file upload lol
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
              ✅ Himesh Reshammiya Music CD
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300">
              ✅ Salman Bhai Fan Club registrations open
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="hero template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="feature template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="bento template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="cards template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="relative w-full h-[80vh] overflow-auto">
      <Timeline data={data} tripData={TRIP_DATA} />
    </div>
  );
}

export default Itinerary