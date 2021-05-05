import { Model } from 'sequelize';

export default class UserData extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      twitterID: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      profileCreatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      twitter_handle: {
        allowNull: true,
        type: DataTypes.STRING
      }
    }, {
      sequelize,
      modelName: 'UserData',
    });
  }
}
