const mysql = require("mysql");
const { readConfig } = require("ls_bots.js");

class Database {
  constructor() {
    this.setupConnection();
  }

  async setupConnection() {
    const config = await readConfig();

    this.connection = mysql.createPool({
      host: config.MySQL.Host,
      user: config.MySQL.User,
      password: config.MySQL.Password,
      database: config.MySQL.Database,
      connectionLimit: 10,
    });
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async createCode(options) {
    return this.query(
      "INSERT INTO ls_redeem (code, type, name, quantity, plate) VALUES (?, ?, ?, ?, ?)",
      [
        options.code,
        options.type,
        options.name,
        options.quantity,
        options.plate,
      ]
    );
  }

  async deleteCode(code) {
    return this.query("DELETE FROM ls_redeem WHERE code = ?", [code]);
  }

  async getAllCodes() {
    return this.query("SELECT * FROM ls_redeem", []);
  }
}

module.exports = new Database();
