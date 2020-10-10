
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Requests', {
    fields: ['userDataID'],
    type: 'foreign key',
    name: 'userDataID_fk',
    references: {
      table: 'UserData',
      field: 'id',
    },
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),

  down: (queryInterface) => queryInterface.removeConstraint('Requests', 'userDataID_fk'),
};
