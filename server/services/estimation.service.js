const WORK_TYPE_RATE = { // Acres covered per hour
  ploughing: 1.5,
  rotavating: 2,
  seeding: 2.5,
  spraying: 4,
  harvesting: 1.2,
  transportation: 1
};

const FUEL_CONSUMPTION = { // Liters consumed per hour
  ploughing: 7,
  rotavating: 6,
  seeding: 4,
  spraying: 2.5,
  harvesting: 10,
  transportation: 5
};

const LABOR_RATE = 200; // INR per hour
const CURRENT_FUEL_PRICE = 96; // INR per liter
const FIXED_SERVICE_FEE = 400; // INR fixed service setup fee

/**
 * Calculates estimates for a booking configuration.
 * @param {string} workType 
 * @param {number} areaAcres 
 * @returns {object} estimates (hours, fuel, cost)
 */
const calculateEstimate = (workType, areaAcres) => {
  const rate = WORK_TYPE_RATE[workType] || 2;
  const fuelRate = FUEL_CONSUMPTION[workType] || 5;

  const hoursEstimated = Math.ceil((areaAcres / rate) * 10) / 10; // Round to 1 decimal place
  const fuelEstimated = Math.ceil((hoursEstimated * fuelRate) * 10) / 10;
  
  const laborCost = Math.round(hoursEstimated * LABOR_RATE);
  const fuelCost = Math.round(fuelEstimated * CURRENT_FUEL_PRICE);
  const totalEstimate = laborCost + fuelCost + FIXED_SERVICE_FEE;

  return {
    estimatedHours: hoursEstimated,
    estimatedFuel: fuelEstimated,
    estimatedCost: totalEstimate
  };
};

module.exports = {
  calculateEstimate,
  WORK_TYPE_RATE,
  FUEL_CONSUMPTION,
  LABOR_RATE,
  CURRENT_FUEL_PRICE,
  FIXED_SERVICE_FEE
};
