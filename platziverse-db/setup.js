"use strict";

const debug = require("debug")("platziverse:db:setup");
const db = require("./");
const inquirer = require("inquirer");
const chalk = require("chalk");
require("dotenv").config();

const prompt = inquirer.createPromptModule();

async function setup() {
  const answer = await prompt([
    {
      type: "confirm",
      name: "setup",
      message: "This will destroy your database, ¿are you sure?",
    },
  ]);

  if (!answer.setup) {
    return debug(chalk.redBright.bgBlack("Nothing happened :)"));
  }

  const config = {
    database: process.env.DB_NAME || "platziverse",
    username: process.env.DB_USER || "admin",
    password: process.env.DB_PASS || "admin",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: (s) => debug(s),
    setup: true,
  };

  await db(config).catch(handleFatalError);

  console.log("Success!");
  process.exit(0);
}

function handleFatalError(err) {
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

setup();
