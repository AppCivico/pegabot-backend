
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Requests', {
    fields: ['apiDataID'],
    type: 'foreign key',
    name: 'apiDataID_fk',
    references: {
      table: 'ApiData',
      field: 'id',
    },
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),

  down: (queryInterface) => queryInterface.removeConstraint('Requests', 'apiDataID_fk'),
};
