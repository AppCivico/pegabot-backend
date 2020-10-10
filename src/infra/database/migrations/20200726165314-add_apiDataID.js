module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Requests', 'apiDataID', Sequelize.INTEGER, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Requests', 'apiDataID', Sequelize.INTEGER, {}),
};
