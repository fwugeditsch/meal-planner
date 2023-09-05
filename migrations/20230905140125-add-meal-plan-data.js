'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MealPlans', 'mealPlanData', {
      type: Sequelize.JSON, // Oder den gewünschten Datentyp (z.B. Sequelize.TEXT)
      allowNull: true, // Je nach Ihren Anforderungen
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('MealPlans', 'mealPlanData');
  },
};
