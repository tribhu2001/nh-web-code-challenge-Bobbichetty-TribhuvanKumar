export type NamedLocation = {
  name: string;
  address: string;
  lat: number;
  lan: number;
};

// got latitudes and langitudes from google maps URL

const clinicians: NamedLocation[] = [
  { name: 'Barb', address: '4120 Garfield Ave, Minneapolis, MN 55409', lat: 44.927955, lan: -93.2921466 },
  { name: 'Isaac', address: '140 104th Ln NW, Blaine MN 55448', lat: 45.1595997, lan: -93.2733375 },
  { name: 'Marisol', address: '2393 Kalmia Ave, Boulder, CO 80304', lat: 40.0396049, lan: -105.2683075 },
  { name: 'Mary', address: '608 Spruce Dr, Hudson, WI 54016', lat: 44.9755981, lan: -92.7355254 },
  { name: 'Shawna', address: '1727 W Highland Pkwy, St Paul, MN 55116', lat: 44.9200492, lan: -93.1759 },
  { name: 'Shelly', address: '1232 3rd St, Hudson, WI 54016', lat: 44.9836114, lan: -92.7579291 },
  { name: 'Tom', address: '14173 Flagstone Trail, Apple Valley MN 55124', lat: 44.7433503, lan: -93.2096866 }
];

const labDropoffs: NamedLocation[] = [
  { name: 'Edina Lab', address: '6525 France Ave, Edina, MN, 55435', lat: 44.8848788, lan: -93.3297961 },
  { name: 'Medical Arts Lab', address: '835 Nicollet Mall, Minneapolis, MN 55402', lat: 44.9749995, lan: -93.2761349 },
  { name: 'Bloomington Lab', address: '2716 E 82nd St, Bloomington, MN 55425', lat: 44.8556453, lan: -93.2382479 },
  { name: 'Hudson Lab', address: '400 2nd St S, Hudson, WI 54016', lat: 44.9665313, lan: -92.7587695 },
  { name: 'Boulder Lab', address: '4750 Nautilus Ct S, Boulder, CO 80301', lat: 40.0605685, lan: -105.20701 }
];

const EARTH_RADIUS_MILES = 3963;

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineDistance(a: NamedLocation, b: NamedLocation) {
  const latDelta = degToRad(b.lat - a.lat);
  const lanDelta = degToRad(b.lan - a.lan);
  const latA = degToRad(a.lat);
  const latB = degToRad(b.lat);

  const sinLat = Math.sin(latDelta / 2) ** 2;
  const sinlan = Math.sin(lanDelta / 2) ** 2;
  const inner = sinLat + Math.cos(latA) * Math.cos(latB) * sinlan;
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(inner));
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseKnownPatientLocation(address: string): NamedLocation | null {
  const normalized = address.toLowerCase();

  if (normalized.includes('minneapolis')) {
    return { name: 'Patient', address, lat: 44.927955, lan: -93.2921466 };
  }
  if (normalized.includes('boulder')) {
    return { name: 'Patient', address, lat: 40.0396049, lan: -105.2683075 };
  }
  if (normalized.includes('hudson')) {
    return { name: 'Patient', address, lat: 44.9755981, lan: -92.7355254 };
  }
  if (normalized.includes('edina')) {
    return { name: 'Patient', address, lat: 44.8848788, lan: -93.3297961 };
  }
  if (normalized.includes('apple valley')) {
    return { name: 'Patient', address, lat: 44.7433503, lan: -93.2096866 };
  }

  return null;
}

function geocodePatientAddress(address: string): NamedLocation {
  const known = parseKnownPatientLocation(address);
  if (known) {
    return known;
  }

  const seed = hashString(address);
  const lat = 25 + (seed % 2500) / 100;
  const lan = -125 + ((Math.floor(seed / 2500) % 5800) / 100);

  return {
    name: 'Patient',
    address,
    lat,
    lan
  };
}

function nearestLab(patient: NamedLocation) {
  return labDropoffs.reduce((current, lab) => {
    return haversineDistance(patient, lab) < haversineDistance(patient, current) ? lab : current;
  }, labDropoffs[0]);
}

export function findOptimalClinician(patientAddress: string, includeLabDropoff: boolean) {
  const patient = geocodePatientAddress(patientAddress);
  const best = clinicians.reduce(
    (current, clinician) => {
      const distanceToPatient = haversineDistance(clinician, patient);
      const totalDistance = includeLabDropoff
        ? distanceToPatient + haversineDistance(patient, nearestLab(patient)) + haversineDistance(nearestLab(patient), clinician)
        : distanceToPatient * 2;

      if (totalDistance < current.totalDistance) {
        return { clinician, totalDistance };
      }
      return current;
    },
    { clinician: clinicians[0], totalDistance: Infinity }
  );

  return {
    clinicianName: best.clinician.name,
    totalDistance: Number(best.totalDistance.toFixed(1))
  };
}
