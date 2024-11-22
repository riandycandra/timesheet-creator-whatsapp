/**
 * @Author: Your name
 * @Date:   2024-11-22 15:48:04
 * @Last Modified by:   Your name
 * @Last Modified time: 2024-11-22 15:49:14
 */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Phone.init({
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Phone',
    tableName: 'phones',
    timestamps: false,
  });
  return Phone;
};