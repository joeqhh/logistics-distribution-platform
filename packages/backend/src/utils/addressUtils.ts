import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point, polygon } from '@turf/helpers'

export const orderCanDeliver = (
  pt: string | number[],
  poly: [number, number][]
): boolean => {
  if (typeof pt === 'string') {
    pt = pt.split(',').map(p => parseFloat(p))
  }
  const p = point(pt)
  poly.push(poly[0])
  const polys = polygon([poly])
  return booleanPointInPolygon(p, polys)
}
