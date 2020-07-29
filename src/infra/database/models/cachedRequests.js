import { Model } from 'sequelize';

export default class CachedRequests extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      cachedResultID: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    }, {
      sequelize,
      modelName: 'CachedRequests',
      freezeTableName: true,
    });
  }
}
