'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Deal } from './DealCard'

interface MapViewProps {
  userLocation: { lat: number; lng: number }
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  flyTo?: { lat: number; lng: number; zoom?: number }
}

export default function MapView({ userLocation, deals, onDealClick, flyTo }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(
      [userLocation.lat, userLocation.lng], 15
    )

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:20px;height:20px;"><div style="position:absolute;inset:0;background:#2563EB;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:2;"></div><div class="map-pulse" style="position:absolute;inset:-6px;background:rgba(37,99,235,0.2);border-radius:50%;"></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)

    if (!document.getElementById('map-pulse-style')) {
      const style = document.createElement('style')
      style.id = 'map-pulse-style'
      style.textContent = `@keyframes mapPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.5);opacity:0}}.map-pulse{animation:mapPulse 2s infinite;}`
      document.head.appendChild(style)
    }

    return () => {
      map.remove()
      mapRef.current = null
      markerMapRef.current.clear()
    }
  }, [userLocation])

  useEffect(() => {
    if (!mapRef.current || !flyTo) return
    mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom ?? 15, { duration: 1.2 })
  }, [flyTo])

  useEffect(() => {
    if (!mapRef.current) return

    // Get current deal IDs
    const currentDealIds = new Set(deals.filter(d => d.location).map(d => d.id))

    // Remove markers for deals that no longer exist
    const markerMap = markerMapRef.current
    for (const [dealId, marker] of markerMap.entries()) {
      if (!currentDealIds.has(dealId)) {
        marker.remove()
        markerMap.delete(dealId)
      }
    }

    // Add/update markers for current deals
    deals.forEach(deal => {
      if (!deal.location) return

      // If marker already exists for this deal, remove it so we can recreate it
      if (markerMap.has(deal.id)) {
        markerMap.get(deal.id)!.remove()
        markerMap.delete(deal.id)
      }

      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#F97316;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.25);border:3px solid white;font-size:14px;cursor:pointer;color:white;font-weight:bold;" data-deal-id="${deal.id}">${deal.discount}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      })

      const marker = L.marker([deal.location.lat, deal.location.lng], { icon })

      // Store the deal ID directly on the marker for later retrieval
      ;(marker as any).dealId = deal.id

      marker.on('click', () => {
        // Find the deal by ID from the CURRENT deals array
        const currentDeal = deals.find(d => d.id === (marker as any).dealId)
        if (currentDeal) {
          onDealClick(currentDeal)
        }
      })

      marker.addTo(mapRef.current!)
      markerMap.set(deal.id, marker)
    })
  }, [deals, onDealClick])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
}
