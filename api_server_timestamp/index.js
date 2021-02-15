const { Requester, Validator } = require('@chainlink/external-adapter')
const express = require("express");
const app = express();
const port = 5000;

const main = (input) => {
  app.get("/", async (req, res) => {
    // The Validator helps you validate the Chainlink request data
    const validator = new Validator(input, {})
    const jobRunID = validator.validated.id

    // make time
    var today = new Date();
    var time = "" + today.getHours() + 0 + today.getMinutes() + 0 + today.getSeconds();

    // returning time
    response = { data: { result: time } };
    console.log("Answered with time : ", response);

    res.status(200).json(Requester.success(jobRunID, response));
  });

  app.listen(port, () => console.log(`Listening on port ${port}!`));

  process.on("SIGINT", () => {
    process.exit();
  });
}

main();
