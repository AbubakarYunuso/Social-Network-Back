const { JsonWebTokenError } = require("jsonwebtoken");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { post } = require("../routes/group.route");

module.exports.userController = {
  // Регистрация пользователя
  registerUser: async (req, res) => {
    const {
      posts,
      groups,
      friends,
      age,
      firstName,
      lastName,
      email,
      number,
      password,
    } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      return res.status(401).json({
        error: "Пользователь с таким Email или Номером уже существует",
      });
    }

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS));

    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      number: number,
      email: email,
      groups,
      friends,
      age,
      image: req.file.path,
      password: hash,
      posts: posts,
    });

    res.json(user);
  },
  // Вход в учетную запись
  login: async (req, res) => {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email: email });
    if (!candidate) {
      return res.status(401).json({ error: "Неверный Email или пароль" });
    }
    const valid = await bcrypt.compare(password, candidate.password);

    if (!valid) {
      return res.status(401).json({ error: "Неверный Email или пароль" });
    }
    const payload = {
      id: candidate._id,
      email: candidate.email,
    };

    const token = await jwt.sign(payload, process.env.SECRET_JWT_KEY, {
      expiresIn: "72h",
    });

    res.json(token);
  },
  // вывод одного пользователя
  getUser: async (req, res) => {
    const data = await User.findById(req.user.id);
    res.json(data);
  },

  addFollow: async (req, res) => {
    const data = await User.findOneAndUpdate(
      { email: req.user.email },
      { $addToSet: { friends: req.body.friends } },
      { new: true }
    ).populate("friends");

    res.json(data.friends);
  },
  allFollow: async (req, res) => {
    const data = await User.findById(req.user.id).populate("friends");
    res.json(data.friends);
  },
};
