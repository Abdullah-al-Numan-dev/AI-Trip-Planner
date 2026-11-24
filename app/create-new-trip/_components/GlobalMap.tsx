"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, {
    type Map as MapboxMap,
    type Marker as MapboxMarker,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
    source?: string | null;
    destination?: string | null;
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

const MARKER_COLORS = {
    source: "#38bdf8",
    destination: "#fb923c",
} as const;

/** Turn a place name from the chat into [longitude, latitude]. */
async function geocode(
    name: string,
    signal: AbortSignal
): Promise<[number, number] | null> {
    if (!TOKEN) return null;

    try {
        const url =
            `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
            `${encodeURIComponent(name)}.json?access_token=${encodeURIComponent(
                TOKEN
            )}&limit=1&types=place,locality,region,country`;

        const response = await fetch(url, { signal });
        if (!response.ok) return null;

        const data = await response.json();
        const center = data?.features?.[0]?.center;

        return Array.isArray(center) && center.length === 2
            ? [Number(center[0]), Number(center[1])]
            : null;
    } catch {
        // A failed/aborted lookup just means this place can't be shown.
        return null;
    }
}

function makeMarkerElement(kind: keyof typeof MARKER_COLORS, label: string) {
    const color = MARKER_COLORS[kind];

    const element = document.createElement("div");
    element.style.cssText =
        "display:flex;align-items:center;gap:6px;pointer-events:none;";

    const dot = document.createElement("span");
    dot.style.cssText =
        `width:10px;height:10px;flex:none;border-radius:9999px;` +
        `background:${color};box-shadow:0 0 0 4px ${color}33;`;

    const text = document.createElement("span");
    text.textContent = label;
    text.style.cssText =
        "max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" +
        "border-radius:9999px;border:1px solid rgba(255,255,255,.18);" +
        "background:rgba(15,23,42,.82);color:#fff;font-size:11px;" +
        "font-weight:600;padding:3px 8px;line-height:1.2;";

    element.append(dot, text);
    return element;
}

/**
 * Decorative globe behind the chat. It spins slowly until the user names a
 * source or destination, then flies there and drops labelled pins.
 */
export default function GlobalMap({ source, destination }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const markersRef = useRef<MapboxMarker[]>([]);
    const frameRef = useRef<number | null>(null);
    const trackingRef = useRef(false);
    const requestRef = useRef<AbortController | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!TOKEN || !container || mapRef.current) return;

        mapboxgl.accessToken = TOKEN;
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        try {
            const map = new mapboxgl.Map({
                container,
                accessToken: TOKEN,
                style: MAP_STYLE,
                projection: "globe",
                center: [0, 18],
                zoom: 1.3,
                minZoom: 0.8,
                maxZoom: 8,
                pitch: 0,
                bearing: -12,
                interactive: false,
                attributionControl: false,
                antialias: true,
                fadeDuration: 0,
            });
            mapRef.current = map;

            const applyFog = () => {
                map.setFog({
                    color: "rgb(201, 222, 245)",
                    "high-color": "rgb(135, 190, 235)",
                    "horizon-blend": 0.05,
                    "space-color": "rgb(12, 28, 50)",
                    "star-intensity": 0.08,
                });
            };

            map.on("load", applyFog);
            map.on("style.load", applyFog);

            // Idle auto-rotation, paused once we start following the trip.
            if (!reduceMotion) {
                const rotate = () => {
                    if (mapRef.current && !trackingRef.current) {
                        map.setBearing((map.getBearing() + 0.018) % 360);
                    }
                    frameRef.current = window.requestAnimationFrame(rotate);
                };
                frameRef.current = window.requestAnimationFrame(rotate);
            }

            return () => {
                if (frameRef.current !== null) {
                    window.cancelAnimationFrame(frameRef.current);
                }
                markersRef.current.forEach((marker) => marker.remove());
                markersRef.current = [];
                map.remove();
                mapRef.current = null;
            };
        } catch {
            // WebGL can be unavailable (old browser, headless, low-power mode).
            setFailed(true);
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        requestRef.current?.abort();
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        if (!source && !destination) {
            trackingRef.current = false;
            return;
        }

        trackingRef.current = true;
        const controller = new AbortController();
        requestRef.current = controller;

        const showPlaces = async () => {
            const [sourcePoint, destinationPoint] = await Promise.all([
                source ? geocode(source, controller.signal) : Promise.resolve(null),
                destination
                    ? geocode(destination, controller.signal)
                    : Promise.resolve(null),
            ]);

            if (controller.signal.aborted) return;

            const focus = destinationPoint ?? sourcePoint;
            if (focus) {
                map.flyTo({
                    center: focus,
                    zoom: 3.1,
                    duration: 2600,
                    essential: true,
                });
            }

            if (sourcePoint && source) {
                markersRef.current.push(
                    new mapboxgl.Marker({
                        element: makeMarkerElement("source", source),
                        anchor: "left",
                    })
                        .setLngLat(sourcePoint)
                        .addTo(map)
                );
            }

            if (destinationPoint && destination) {
                markersRef.current.push(
                    new mapboxgl.Marker({
                        element: makeMarkerElement("destination", destination),
                        anchor: "left",
                    })
                        .setLngLat(destinationPoint)
                        .addTo(map)
                );
            }
        };

        void showPlaces();

        return () => controller.abort();
    }, [source, destination]);

    if (!TOKEN || failed) {
        return (
            <div
                aria-hidden='true'
                className='h-full w-full bg-[radial-gradient(circle_at_70%_35%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_25%_70%,rgba(99,102,241,0.14),transparent_50%)]'
            />
        );
    }

    return <div ref={containerRef} className='h-full w-full' aria-hidden='true' />;
}
