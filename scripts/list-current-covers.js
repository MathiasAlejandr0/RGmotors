const fs = require('fs');

const vehicles = JSON.parse(fs.readFileSync('data/vehicles.json', 'utf8'));
const withPhotos = vehicles.filter(v => v.hasRealPhotos);

console.log('Vehicles with real photos count:', withPhotos.length);
withPhotos.forEach((v, i) => {
  console.log(`${i + 1}. [${v.plate}] ${v.brand} ${v.model} (${v.year}) -> ${v.image}`);
});
