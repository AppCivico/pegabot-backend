import { Model } from 'sequelize';

export default class Feedback extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      analysisID: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      opinion: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    }, {
      sequelize,
      modelName: 'Feedbacks',
      freezeTableName: true,
    });
  }
}
