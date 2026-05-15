## How to run the code
npm install

npm run dev

## How the optimal clinician is picked
nearestLab(patient) => Finds the closest lab dropoff to the patient by comparing Haversine distances.

findOptimalClinician(patientAddress, includeLabDropoff) => Convert the patient address into coordinates via geocodePatientAddress

### For each clinician:

compute distanceToPatient

    if includeLabDropoff is true:
        total distance = clinician -> patient + patient -> nearest lab + nearest lab -> clinician
    else:
        total distance = distanceToPatient * 2

Choose the clinician with the smallest totalDistance

Finally, it returns:
    clinicianName
    totalDistance rounded to one decimal

Components => Theme.tsx, Patient Componeny, Result Component
Utils => GMAP
Styles => Theme.module.css, 
services/api => Geo Location API, Clicians API, Labs API

