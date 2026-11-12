export type GeoCoordinates = {
    latitude?: number | string;
    longitude?: number | string;
};

export type Hotel = {
    hotel_name?: string;
    hotel_address?: string;
    price_per_night?: string;
    hotel_image_url?: string;
    geo_coordinates?: GeoCoordinates;
    rating?: number | string;
    description?: string;
};

export type Activity = {
    place_name?: string;
    place_details?: string;
    place_image_url?: string;
    geo_coordinates?: GeoCoordinates;
    place_address?: string;
    ticket_pricing?: string;
    time_travel_each_location?: string;
    best_time_to_visit?: string;
};

export type ItineraryDay = {
    day?: number | string;
    day_plan?: string;
    best_time_to_visit_day?: string;
    activities?: Activity[];
};

export type TripPlan = {
    destination?: string;
    duration?: string;
    origin?: string;
    budget?: string;
    group_size?: string;
    hotels?: Hotel[];
    itinerary?: ItineraryDay[];
};

export type SavedTrip = {
    _id?: string;
    _creationTime?: number;
    tripId: string;
    tripDetail: TripPlan;
};

export type PlaceInfo = {
    id?: string;
    name?: string;
    address?: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    googleMapsUri?: string;
    websiteUri?: string;
    types?: string[];
    photoUrl?: string | null;
};
