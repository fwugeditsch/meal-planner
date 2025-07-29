'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Füge is_deleted Spalte hinzu
    await queryInterface.addColumn('Dishes', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    // Füge deleted_at Spalte hinzu
    await queryInterface.addColumn('Dishes', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Entferne die Spalten bei Rollback
    await queryInterface.removeColumn('Dishes', 'is_deleted');
    await queryInterface.removeColumn('Dishes', 'deleted_at');
  }
};
