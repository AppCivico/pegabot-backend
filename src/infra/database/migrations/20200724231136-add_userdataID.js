module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Requests', 'userDataID', Sequelize.INTEGER, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Requests', 'userDataID', Sequelize.INTEGER, {}),
};
