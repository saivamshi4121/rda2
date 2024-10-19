import readline from 'readline';

// Interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Recommended daily values (based on general guidelines)
const dailyValues = {
    energy: 2230,                // kcal
    protein: 55,                 // g
    carbohydrates: 330,          // g
    addedSugars: 30,             // g
    dietaryFiber: 30,            // g
    totalFat: 74,                // g
    saturatedFat: 22,            // g
    sodium: 2000,                // mg
    monounsaturatedFat: 25,      // g
    polyunsaturatedFat: 25,      // g
    transFat: 2                  // g
};

// Function to get nutritional information from the user
function getNutritionalInfo(callback) {
    rl.question('Enter the nutritional information in the format: "energy protein carbohydrates added_sugars dietary_fiber total_fat saturated_fat monounsaturated_fat polyunsaturated_fat trans_fat sodium" (you can skip optional values with space or leave them blank): ', (nutritionInput) => {
        const nutritionValues = nutritionInput.split(' ').map(value => value !== '' ? parseFloat(value) : undefined);

        const [
            energy,                // Energy in kcal
            protein,               // Protein in g
            carbohydrates,         // Total carbohydrates in g
            addedSugars = 0,       // Added sugars in g (default to 0 if missing)
            dietaryFiber = 0,      // Dietary fiber in g (default to 0 if missing)
            totalFat,              // Total fat in g
            saturatedFat,          // Saturated fat in g
            monounsaturatedFat = 0,// Monounsaturated fat in g (default to 0 if missing)
            polyunsaturatedFat = 0,// Polyunsaturated fat in g (default to 0 if missing)
            transFat = 0,          // Trans fat in g (default to 0 if missing)
            sodium                 // Sodium in mg
        ] = nutritionValues;

        if (nutritionValues.some((value, index) => value === undefined && index < 6)) {
            console.error("Invalid input: essential values like energy, protein, carbohydrates, total fat, saturated fat, and sodium are required.");
            getNutritionalInfo(callback); // Ask again
            return;
        }

        rl.question('Is this product solid (grams) or liquid (milliliters)? (Enter "g" for solid or "ml" for liquid): ', (unit) => {
            if (unit !== 'g' && unit !== 'ml') {
                console.error('Invalid unit. Please enter "g" for solid or "ml" for liquid.');
                getNutritionalInfo(callback); // Ask again
                return;
            }

            rl.question(`Enter the serving size in ${unit}: `, (servingSizeInput) => {
                const servingSize = parseFloat(servingSizeInput);
                if (isNaN(servingSize) || servingSize <= 0) {
                    console.error("Invalid serving size. Please enter a valid number.");
                    getNutritionalInfo(callback); // Ask again
                    return;
                }

                const nutritionData = {
                    energy,
                    protein,
                    carbohydrates,
                    addedSugars,
                    dietaryFiber,
                    totalFat,
                    saturatedFat,
                    monounsaturatedFat,
                    polyunsaturatedFat,
                    transFat,
                    sodium,
                    servingSize,
                    unit
                };

                callback(nutritionData); // Return the nutrition data to the callback function
            });
        });
    });
}

// Function to scale nutrition values based on user's serving size
function scaleNutrition(nutritionPerServing, userServingSize) {
    const scalingFactor = userServingSize / nutritionPerServing.servingSize; // Calculate scaling factor

    return {
        energy: (nutritionPerServing.energy * scalingFactor).toFixed(2),                // Energy in kcal
        protein: (nutritionPerServing.protein * scalingFactor).toFixed(2),              // Protein in g
        carbohydrates: (nutritionPerServing.carbohydrates * scalingFactor).toFixed(2),  // Total carbs in g
        addedSugars: (nutritionPerServing.addedSugars * scalingFactor).toFixed(2),      // Added sugars in g
        dietaryFiber: (nutritionPerServing.dietaryFiber * scalingFactor).toFixed(2),    // Dietary fiber in g
        totalFat: (nutritionPerServing.totalFat * scalingFactor).toFixed(2),            // Total fat in g
        saturatedFat: (nutritionPerServing.saturatedFat * scalingFactor).toFixed(2),    // Saturated fat in g
        monounsaturatedFat: (nutritionPerServing.monounsaturatedFat * scalingFactor).toFixed(2), // Monounsaturated fat in g
        polyunsaturatedFat: (nutritionPerServing.polyunsaturatedFat * scalingFactor).toFixed(2), // Polyunsaturated fat in g
        transFat: (nutritionPerServing.transFat * scalingFactor).toFixed(2),            // Trans fat in g
        sodium: (nutritionPerServing.sodium * scalingFactor).toFixed(2)                 // Sodium in mg
    };
}

// Function to calculate percentage of daily value
function calculatePercentage(nutrientValue, dailyValue) {
    if (!dailyValue || nutrientValue === "NaN") return 'N/A';
    return ((nutrientValue / dailyValue) * 100).toFixed(2) + '%';
}

// Start the prompt to get nutritional info
getNutritionalInfo((nutritionData) => {
    rl.question(`Enter the serving size you consumed (in ${nutritionData.unit}): `, (userServingSizeInput) => {
        const userServingSize = parseFloat(userServingSizeInput);

        if (isNaN(userServingSize) || userServingSize <= 0) {
            console.error("Invalid serving size. Please enter a valid number.");
            rl.close();
            return;
        }

        // Calculate scaled nutrition values
        const scaledNutrition = scaleNutrition(nutritionData, userServingSize);

        // Display the scaled nutrition values with percentages
        console.log(`\nNutrition values for a serving of ${userServingSize.toFixed(2)} ${nutritionData.unit}:`);
        console.log(`Energy: ${scaledNutrition.energy} kcal (${calculatePercentage(scaledNutrition.energy, dailyValues.energy)})`);
        console.log(`Protein: ${scaledNutrition.protein} g (${calculatePercentage(scaledNutrition.protein, dailyValues.protein)})`);
        console.log(`Carbohydrates: ${scaledNutrition.carbohydrates} g (${calculatePercentage(scaledNutrition.carbohydrates, dailyValues.carbohydrates)})`);
        if (nutritionData.addedSugars) console.log(`Added Sugars: ${scaledNutrition.addedSugars} g (${calculatePercentage(scaledNutrition.addedSugars, dailyValues.addedSugars)})`);
        if (nutritionData.dietaryFiber) console.log(`Dietary Fiber: ${scaledNutrition.dietaryFiber} g (${calculatePercentage(scaledNutrition.dietaryFiber, dailyValues.dietaryFiber)})`);
        console.log(`Total Fat: ${scaledNutrition.totalFat} g (${calculatePercentage(scaledNutrition.totalFat, dailyValues.totalFat)})`);
        console.log(`Saturated Fat: ${scaledNutrition.saturatedFat} g (${calculatePercentage(scaledNutrition.saturatedFat, dailyValues.saturatedFat)})`);
        if (nutritionData.monounsaturatedFat) console.log(`Monounsaturated Fat: ${scaledNutrition.monounsaturatedFat} g (${calculatePercentage(scaledNutrition.monounsaturatedFat, dailyValues.monounsaturatedFat)})`);
        if (nutritionData.polyunsaturatedFat) console.log(`Polyunsaturated Fat: ${scaledNutrition.polyunsaturatedFat} g (${calculatePercentage(scaledNutrition.polyunsaturatedFat, dailyValues.polyunsaturatedFat)})`);
        if (nutritionData.transFat) console.log(`Trans Fat: ${scaledNutrition.transFat} g (${calculatePercentage(scaledNutrition.transFat, dailyValues.transFat)})`);
        console.log(`Sodium: ${scaledNutrition.sodium} mg (${calculatePercentage(scaledNutrition.sodium, dailyValues.sodium)})`);

        rl.close();
    });
});
