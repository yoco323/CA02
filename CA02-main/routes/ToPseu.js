//routes by Tianqi He
const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const config = require('../config');
const GPT = require('../models/GPT');
const User = require('../models/User');



const configuration = new Configuration({
  apiKey: config.API_KEY,
});
const openai = new OpenAIApi(configuration);

isLoggedIn = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/gptApp", isLoggedIn, async (req, res, next) => {
  res.render("gptApp");
});

router.get("/improveCode", isLoggedIn, async (req, res, next) => {
  res.render("improveCode", { answer: "" });
});

router.post("/improveCode", isLoggedIn, async (req, res, next) => {
  question = req.body.prompt;

  q = "Convert Code to Pseudocode" + "/n" + question;
  answer = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: q,
    max_tokens: 1024,
    n: 1,
    temperature: 0.8,
  });
  const history = new GPT(
    {
        prompt: q,
        answer: answer.data.choices[0].text,
        userId: req.user._id,
    })
    await history.save()
  res.render("improveCode", { answer: answer.data.choices[0].text });
});
router.get('/gptApp/history',
    isLoggedIn,
    async (req, res, next) => {
        let items = await GPT.find({ userId: req.user._id })
        res.render('history', { items })
    }
)
module.exports = router;
