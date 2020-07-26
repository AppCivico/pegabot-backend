import { Model } from 'sequelize';

export default class ApiData extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      params: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      statusesUserTimeline: {
        allowNull: true,
        type: DataTypes.JSON,
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
      modelName: 'ApiData',
      freezeTableName: true,
    });
  }
}
